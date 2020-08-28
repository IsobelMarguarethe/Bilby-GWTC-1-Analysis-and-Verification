# Running `bilby_pipe` review tests

Below are the commands required to reproduce the `bilby_pipe` review test results contained in this repo.

## Fiducial event tests

### BBH

`bilby_pipe_review --bbh --prior 4s --duration 4 --directory fiducial_bbh --submit`

### BNS

`bilby_pipe_review --bns --prior 128s_tidal_lowspin --duration 128 --roq --roq-folder /path/to/ROQ/folder/128s/ --directory fiducial_bns_ROQ_lowspin --submit`

## PP-tests

### 4s prior

`bilby_pipe_review --pp-test --prior 4s --duration 4 --directory pp_test_4s --submit`

### 8s prior

`bilby_pipe_review --pp-test --prior 8s --duration 8 --directory pp_test_8s--submit`

### 16s prior

`bilby_pipe_review --pp-test --prior 16s --duration 16 --directory pp_test_16s --submit`

### high mass prior

`bilby_pipe_review --pp-test --prior high_mass --duration 4 --directory pp_test_high_mass --submit`


### 128s prior with ROQ

`bilby_pipe_review --pp-test --prior 128s --duration 128 --roq --roq-folder /path/to/ROQ/folder/128s/ --directory pp_test_128s_ROQ --submit`
