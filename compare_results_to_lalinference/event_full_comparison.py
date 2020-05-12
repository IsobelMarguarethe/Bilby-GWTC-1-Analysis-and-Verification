#!/usr/bin/env python3
# This script loads in GWTC-1 samples from LALInference and bilby
# Produces a pp-plot for all parameters
# Evaluates the JS-diverence for each parameters and it's uncertainty (via bootstrapping)

import pandas as pd
import json
from tqdm import tqdm
import argparse
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom
from bilby.gw.conversion import generate_tidal_parameters

np.random.seed(seed=150914)

plt.rcParams.update(
        {'axes.labelsize': 30,
        'font.size':       30,
        'legend.fontsize': 30,
        'xtick.labelsize': 30,
        'ytick.labelsize': 30,
        'axes.titlesize' : 30,
        'text.usetex': True,
        'font.family': "serif",
        'font.serif': "Computer Modern Roman",
        # 'font.weight':'heavy',
        'savefig.dpi': 500
        })

fontparams = {'mathtext.fontset': 'stix',
             'font.family': 'serif',
             'font.serif': "Computer Modern Roman"}

from pesummary.core.webpage.main import _WebpageGeneration
from scipy.stats import gaussian_kde
from pesummary.core.plots.bounded_1d_kde import Bounded_1d_kde
from pesummary.gw.plots.bounds import default_bounds
from collections import namedtuple

bilby_to_latex = dict(
    a_1="$a_1$",
    a_2="$a_2$",
    luminosity_distance="$d_L$", #" [Mpc]",
    ra="$\\alpha$",
    dec="$\\delta$",
    theta_jn="$\\theta_{\\rm JN}$",
    tilt_1="$\\theta_1$",
    tilt_2="$\\theta_2$",
    chirp_mass="$\mathcal{M}$", #" [M$_\odot$]",
    mass_ratio="$q$",
    mass_1="$m_1$", # [M$_\odot$]",
    mass_2="$m_2$", # [M$_\odot$]"
    delta_lambda="$\\Delta\\Lambda$",
    delta_lambda_tilde="$\\Delta\\tilde{\\Lambda}$",
    lambda_tilde="$\\hat{\\Lambda}$"
)

########### Defining functions needed ##############

def load_event_data(event, data_path="/home/isobel.romero-shaw/bilby-gwtc-1-analysis-and-verification/"):
    """
    Returns lalinference and bilby posterior samples
    for a given event (passes as a string)
    """
    bilby_data = data_path + "gwtc-1_analysis_results/downsampled_posterior_samples/"+ event + "_downsampled_posterior_samples.dat"
    lalinference_data = data_path + "compare_results_to_lalinference/" + event + "/rejection_lalinference_posterior_samples.dat"       
    lalinference_posterior_samples = pd.read_csv(lalinference_data, delimiter=' ')
    bilby_posterior_samples = pd.read_csv(bilby_data, delimiter=' ')
    try:
        bilby_posterior_samples['mass_1']
    except KeyError:
        # allows reading file if using samples downloaded from PESummary
        bilby_posterior_samples = pd.read_csv(bilby_data, delimiter='\t')
    return bilby_posterior_samples, lalinference_posterior_samples

def js_bootstrap(key, set_1, set_2, nsamples, ntests):
    '''
    key: string posterior parameter
    set_1: first full posterior samples set
    set_2: second full posterior samples set
    nsamples: number for downsampling full sample set
    ntests: number of iterations over different nsamples realisations
    returns: 1 dim array (ntests)
    '''
    js_array = np.zeros(ntests)
    for j in tqdm(range(ntests)):
        nsamples = min([nsamples, len(set_1[key]), len(set_2[key])])
        lp = np.random.choice(set_1[key], size=nsamples, replace=False)
        bp = np.random.choice(set_2[key], size=nsamples, replace=False)
        x = np.atleast_2d(np.linspace(np.min([np.min(bp), np.min(lp)]),np.max([np.max(bp), np.max(lp)]),100)).T
        xlow = np.min(x)
        xhigh = np.max(x)
        if key in default_bounds.keys():
            bounds = default_bounds[key]
            if "low" in bounds.keys():
                xlow = bounds["low"]
            if "high" in bounds.keys():
                if isinstance(bounds["high"], str) and "mass_1" in bounds["high"]:
                    xhigh = np.max(x)
                else:
                    xhigh = bounds["high"]
        set_1_pdf = Bounded_1d_kde(bp, xlow=xlow, xhigh=xhigh)(x)
        set_2_pdf = Bounded_1d_kde(lp, xlow=xlow, xhigh=xhigh)(x)
        js_array[j] = np.nan_to_num(_WebpageGeneration.jension_shannon_divergence(set_1_pdf, set_2_pdf))
    return js_array

def calc_median_error(jsvalues, quantiles=(0.16, 0.84)):
    quants_to_compute = np.array([quantiles[0], 0.5, quantiles[1]])
    quants = np.percentile(jsvalues, quants_to_compute * 100)
    summary = namedtuple('summary', ['median', 'lower', 'upper'])
    summary.median = quants[1]
    summary.plus = quants[2] - summary.median
    summary.minus = summary.median - quants[0]
    return summary

def bin_series_and_calc_cdf(x, y, bins = 100):
    """
    Bin two unequal lenght series into equal bins
    and calculate their cumulative distibution function
    in order to generate pp-plots 
    """
    boundaries = sorted(x)[::round(len(x)/bins)+1]
    labels = [(boundaries[i]+boundaries[i+1])/2 for i in range(len(boundaries)-1)]
    # Bin two series into equal bins
    try:
        xb = pd.cut(x, bins=boundaries, labels=labels)
        yb = pd.cut(y, bins=boundaries, labels=labels)
        # Get value counts for each bin and sort by bin
        xhist = xb.value_counts().sort_index(ascending=True)/len(xb)
        yhist = yb.value_counts().sort_index(ascending=True)/len(yb)
        # Make cumulative
        for ser in [xhist, yhist]:
            ttl = 0
            for idx, val in ser.iteritems():
                ttl += val
                ser.loc[idx] = ttl
    except ValueError:
        xhist = np.linspace(0, 1, 1000)
        yhist = np.linspace(0, 1, 1000)
    return xhist, yhist

def calculate_CI(len_samples, confidence_level=0.95, n_points=1001):
    """
    (https://git.ligo.org/lscsoft/bilby/blob/master/bilby/core/result.py#L1578)
    """
    x_values = np.linspace(0, 1, n_points)
    N = len_samples
    edge_of_bound = (1. - confidence_level) / 2. 
    lower = binom.ppf(1 - edge_of_bound, N, x_values) / N
    upper = binom.ppf(edge_of_bound, N, x_values) / N
    lower[0] = 0
    upper[0] = 0
    return x_values, upper, lower

def pp_plot(bilby_samples, lalinf_samples, main_keys, event, nsamples, js_data = None, save = True):
    """
    Produce PP plot between bilby and lalinference samples
    for a set of paramaters (main keys) for a given event.
    """
    # Creating dict where ks_data for each event will be saved
    fig, ax = plt.subplots(figsize = (12, 10))
    pvalues = list()
    for key_index, key in enumerate(main_keys):
        try:
            nsamples = min(nsamples, len(lalinf_samples[key]))
            lp = np.random.choice(lalinf_samples[key], size = nsamples, replace = False)
            bp = np.random.choice(bilby_samples[key], size = nsamples, replace = False)
    # Bin posterior samples into equal lenght bins and calculate cumulative
            xhist, yhist = bin_series_and_calc_cdf(bp, lp)
            if js_data!=None:
                summary = js_data[key]
                fmt = "{{0:{0}}}".format('.5f').format
                ax.plot(xhist, yhist - xhist, label=bilby_to_latex[key] + r" ${{{0}}}_{{-{1}}}^{{+{2}}}$".format(
                    fmt(summary.median), fmt(summary.minus), fmt(summary.plus)), linewidth=2, linestyle = '--')
            else:
                print('No js values are being passed')
                ax.plot(xhist, yhist - xhist, label=bilby_to_latex[key], linewidth=2, linestyle = '--')              
    # Calculating confidence bands 
        except KeyError:
            print(f"{key} missing")
    for confidence in [0.68, 0.95, 0.997]:
        x_values, upper, lower = calculate_CI(nsamples, confidence_level=confidence)
        ax.fill_between(x_values, lower - x_values, upper - x_values, linewidth=1, color='k', alpha=0.1)
    ax.set_xlabel(r'Bilby CDF')
    ax.set_ylabel(r'LALInference CDF - Bilby CDF')
    ax.set_xlim(0, 1)
    ax.legend(loc='upper right', ncol=4, fontsize=14)
    plt.title(event + ' N samples={:.0f}'.format(nsamples))
    plt.grid()
    fig.tight_layout()
    if save==True:
        plt.savefig("{}-comparison-plot.png".format(event))

###### Set up parser #############

def parse_cmd_line():
    desc = '''
    Data to use for comparison and set up. 

    '''
    parser = argparse.ArgumentParser(description=desc,
            formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--event', type=str, 
                      default='GW150914', required=False, help='String: event name')
    parser.add_argument('--data_path', type=str, 
                        default='/home/isobel.romero-shaw/bilby-gwtc-1-analysis-and-verification/',
                        required=False, help='String: path of lalinf and bilby samples')
    parser.add_argument('--main_keys', nargs='+',
                        default=['theta_jn', 'chirp_mass', 'mass_ratio', 'tilt_1', 'tilt_2',
                                 'luminosity_distance','ra', 'dec','a_1', 'a_2', 
                        ],
                        required=False, help='List of parameter names') 
    parser.add_argument('--ntests', type=int,
                       default=100, required=False, help='Number of iteration for bootstrapping')
    parser.add_argument('--nsamples', type=int,
                       default=10000, required=False, help='Number of samples to use')
    parser.add_argument('--load_js', type=bool,
                       default=False, required=False, help='Load pre-calculated js values')
    
    args = parser.parse_args()
    return args

######### Main ############

def main():
    args = parse_cmd_line()
    
    main_keys = args.main_keys

    bilby_samples, lalinf_samples = load_event_data(args.event, args.data_path)
    
    if any('lambda' in key for key in main_keys):
        bilby_samples = generate_tidal_parameters(bilby_samples)
        lalinf_samples = generate_tidal_parameters(lalinf_samples)
    
    gwtc1_summary = dict()

####### Loop over all parameters ############
    if args.load_js==False:
        print('Evaluating JS divergence..') 
        js_gwtc1 = np.zeros((args.ntests, len(main_keys)))
        for i, key in enumerate(main_keys):
            try:
                js_gwtc1[:,i] = js_bootstrap(key, bilby_samples, lalinf_samples, args.nsamples, ntests=args.ntests)
                gwtc1_summary[key]  =calc_median_error(js_gwtc1[:,i])
            except KeyError:
                pass
        np.savetxt('{}-js-results.txt'.format(args.event),js_gwtc1, header = ' '.join(main_keys))
    else:
        js_gwtc1 = np.loadtxt('{}-js-results.txt'.format(args.event))
        for i, key in enumerate(main_keys):
            try:
                gwtc1_summary[key] = calc_median_error(js_gwtc1[:,i])
            except KeyError:
                pass
    print('Making pp-plot..')        
    pp_plot(bilby_samples, lalinf_samples, main_keys, args.event, args.nsamples, js_data = gwtc1_summary)
    
# Add function to load reference js values and plot table comparing
# reference with js values for event
# with open('js-comparison-table.txt', 'w') as f:
#     print('hello world', file=f)

if __name__ == "__main__":
    main()
