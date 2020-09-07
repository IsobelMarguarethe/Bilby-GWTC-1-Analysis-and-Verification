# Bilby GWTC-1 Analysis and Verification [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3833601.svg)](https://doi.org/10.5281/zenodo.3833601)

This repository points to results from an analysis of GWTC-1 using `bilby`. 
It also contains comparisons to the `LALInference` results, which are reweighted to the `bilby` priors. 
All settings used to reproduce the runs using `bilby` are provided. 
We use publicly available GWTC-1 [calibration envelopes](https://dcc.ligo.org/LIGO-P1900040/public) and [PSDs](https://dcc.ligo.org/LIGO-P1900011/public). We compare `bilby` posteriors to the [`LALInference` public posterior samples release for GWTC-1](https://dcc.ligo.org/LIGO-P1800370/public), reweighting the `LALInference` samples to the priors we used to obtain the `bilby` samples.

User-friendly webpages comparing `bilby` results to reweighted `lalinference` results, allowing easy navigation between events, can be found [here](https://bilby-gwtc1.github.io).
