import argparse
import os
import pandas as pd

import matplotlib.pyplot as plt
import numpy as np

import h5py
from bilby.core.prior import PriorDict, PowerLaw
from bilby.core.utils import check_directory_exists_and_if_not_mkdir
from bilby.gw.conversion import component_masses_to_chirp_mass, convert_to_lal_binary_black_hole_parameters, generate_mass_parameters
from bilby.gw.result import CBCResult

from matplotlib import rcParams

fontparams = {'mathtext.fontset': 'stix',
             'font.family': 'serif',
             'font.serif': "Times New Roman",
             'mathtext.rm': "Times New Roman",
             'mathtext.it': "Times New Roman:italic",
             'mathtext.sf': 'Times New Roman',
             'mathtext.tt': 'Times New Roman'}
rcParams.update(fontparams)

np.random.seed(150914)


OLD_SOLAR_MASS = 1.9885469549614615e+30
NEW_SOLAR_MASS = 1.9884099021470415e+30


def transformed_samples(samples):
    samples, _ = convert_to_lal_binary_black_hole_parameters(samples)
    return generate_mass_parameters(samples)


def jacobian(samples):
    return samples['chirp_mass'] / np.square(samples['mass_1'])


def prior_probability(prior, sample):
    if prior.evaluate_constraints(sample):
        return prior.prob(sample)
    else:
        return 0


def binary_bilby_prior_weights(bilby_samples, lal_prior, bilby_prior):
    weights_list = []
    for i, d in enumerate(bilby_samples['luminosity_distance']):
        sample = {key: bilby_samples[key][i] for key in bilby_samples.keys()}
        lal_sample = {key: sample[key] for key in sample.keys() if key in lal_prior.keys()}
        lal_prob = prior_probability(lal_prior, lal_sample)
        if lal_prob == 0:
            weights_list.append(0)
        else:
            weights_list.append(1)
    return weights_list



def sample_weights(lal_samples, lal_prior, bilby_prior):
    weights_list = []
    for i, M in enumerate(lal_samples['total_mass']):
        sample = {key: lal_samples[key][i] for key in lal_samples.keys()}
        lal_sample = {key: sample[key] for key in sample.keys() if key in lal_prior.keys()}
        bilby_sample = {key: sample[key] for key in sample.keys() if key in bilby_prior.keys()}
        lal_prob = prior_probability(lal_prior, lal_sample)
        bilby_prob = prior_probability(bilby_prior, bilby_sample)
        if lal_prob == 0:
            weights_list.append(0)
        else:
            weights_list.append(bilby_prob / lal_prob)
    return weights_list


# Set up the argument parser
parser = argparse.ArgumentParser("Plot the posterior alongside LALInference reweighted")
parser.add_argument('-p', '--prior-path', required=True,
                    help='Path to the prior used for the bilby analysis'
                    )
parser.add_argument('-e', '--event', required=True,
                    help='Name of event'
                    )
parser.add_argument('-l', '--lalinference-mock-prior-path', required=True,
                    help="Path to the file used to set up the bilby mock-lalinference prior"
                    )
parser.add_argument('-g', '--gwtc1-path', required=True,
                    help="Path to the GWTC-1 data release repo",
                    )
parser.add_argument('-o', '--outdir', required=True,
                    help="Outdir for plots"
                    )
parser.add_argument('--apply-jacobian', default=True,
                    help=""
                         "Apply the Jacobian that transforms posteriors that are sampled in component masses to "
                         "posteriors that are sampled in chirp mass and mass ratio, as well as weights"
                    )
args = parser.parse_args()

# Dictionary mapping bilby to lalinference names
bilby_to_lalinference = dict(
    a_1="spin1",
    a_2="spin2",
    luminosity_distance="luminosity_distance_Mpc",
    ra="right_ascension",
    dec="declination",
    cos_theta_jn="costheta_jn",
    cos_tilt_1="costilt1",
    cos_tilt_2="costilt2",
    mass_1="m1_detector_frame_Msun",
    mass_2="m2_detector_frame_Msun",
)

# Read the LALInference file
lal_file = os.path.join(args.gwtc1_path, '{}_GWTC-1.hdf5'.format(args.event))
lal = h5py.File(lal_file, 'r')

# Read the LALInference posterior
lal_posterior_samples = {
        list(bilby_to_lalinference.keys())[list(bilby_to_lalinference.values()).index(key)]: lal['IMRPhenomPv2_posterior'][key]
        for key in bilby_to_lalinference.values()
}
# Convert to new solar mass
lal_posterior_samples['mass_1'] = lal_posterior_samples['mass_1'] * NEW_SOLAR_MASS / OLD_SOLAR_MASS
lal_posterior_samples['mass_2']	= lal_posterior_samples['mass_2'] * NEW_SOLAR_MASS / OLD_SOLAR_MASS

# Transform posterior samples
posterior_samples = transformed_samples(lal_posterior_samples)

# Read the LALInference prior
lal_prior_samples = {
        list(bilby_to_lalinference.keys())[list(bilby_to_lalinference.values()).index(key)]: lal['prior'][key]
        for key in bilby_to_lalinference.values()
}
prior_length = len(lal_prior_samples['mass_1'])

# Set up the bilby prior
bilby_prior_dict = PriorDict(filename=args.prior_path, conversion_function=convert_to_lal_binary_black_hole_parameters)
bilby_prior_samples = pd.DataFrame(bilby_prior_dict.sample(prior_length))

# Set up the bilby mock-LALInference prior
mock_lal_prior_dict = PriorDict(filename=args.lalinference_mock_prior_path, conversion_function=generate_mass_parameters)
mock_lal_prior_samples = pd.DataFrame(mock_lal_prior_dict.sample(prior_length))

# Store weights in a dictionary
weights = sample_weights(posterior_samples, mock_lal_prior_dict, bilby_prior_dict)
# Apply the Jacobian if required
if args.apply_jacobian == True:
    weights = np.multiply(weights, jacobian(posterior_samples))

lal_result_object = CBCResult(label='reweighted_lalinference', outdir=args.event, posterior=pd.DataFrame.from_dict(posterior_samples))
lal_result_object.posterior = lal_result_object.posterior.sample(10000, weights=weights)
lal_result_object.save_posterior_samples(outdir=args.event)

neff = np.square(np.sum(weights))/np.sum(np.square(weights))
print('reweighting neff: {}'.format(neff))
print('reweighting efficiency: {}'.format(neff/len(weights)))

# Rejection sampling
nsamp = np.sum(weights)/np.max(weights)
print('rejection nsamp: {}'.format(nsamp))
print('rejection efficiency: {}'.format(nsamp/len(weights)))
keep_indices = weights > np.random.uniform(0, np.max(weights), weights.shape)
lal_new_samples = {key: posterior_samples[key][keep_indices] for key in posterior_samples}
lal_result_object = CBCResult(label='rejection_lalinference', outdir=args.event, posterior=pd.DataFrame.from_dict(lal_new_samples))
lal_result_object.save_posterior_samples(outdir=args.event)
