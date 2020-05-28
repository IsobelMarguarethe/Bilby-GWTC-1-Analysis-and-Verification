#!/usr/bin/env python
""" Script to convert a result into the standard format of this directory """

import argparse

import bilby
import numpy as np

# Set a random seed so the resampling is reproducible
np.random.seed(1234)

parser = argparse.ArgumentParser()
parser.add_argument('result', help="The result file to import")
parser.add_argument('-e', '--event', help="The event name", required=True)
parser.add_argument('-N', '--Nsamples', default=50000, type=int,
                    help="Number of samples in the dat file")
parser.add_argument('-l', '--extra-label', nargs="*", default=None,
                    help="Extra elements to add to the label")
parser.add_argument('-a', '--approximant', type=str, default=None,
                    help="Waveform approximant, if not given uses result")
parser.add_argument('--sampler', type=str, default=None,
                    help="Sampler, if not given uses result")
parser.add_argument('--outdir', type=str, default=None,
                    help="Output directory to use")
args = parser.parse_args()

result = bilby.gw.result.CBCResult.from_json(args.result)
outdir = './gwtc-1_analysis_results/downsampled_posterior_samples/'
if args.outdir:
    outdir=args.outdir
result.outdir=outdir

if args.approximant is None:
    args.approximant = result.waveform_approximant
if args.sampler is None:
    args.sampler = result.sampler

result.label = f"{args.event}_downsampled"
Nsamples = args.Nsamples

if args.extra_label is not None:
    result.label += "_" + "_".join(args.extra_label)

if args.Nsamples > len(result.posterior):
    print("Requesting Nsamples={} when posterior only has {}"
                     .format(args.Nsamples, len(result.posterior)))
    Nsamples = len(result.posterior)

# Save the result downsampled 
result.posterior = result.posterior.sample(Nsamples)
result.save_posterior_samples(outdir=outdir)
result.save_to_file(outdir='./gwtc-1_analysis_results/bilby_result_files/')
