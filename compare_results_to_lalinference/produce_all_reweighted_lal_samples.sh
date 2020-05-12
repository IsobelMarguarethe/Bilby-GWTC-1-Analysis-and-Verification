#!/bin/bash
for d in GW150914 GW151012 GW170104 GW170809 GW170814 GW170818; do
 echo ${d};
 python produce_reweighted_lal_samples_BBH.py -e ${d} -p ~/bilby_pipe/bilby_pipe/data_files/4s.prior -l mock_lalinference_priors/${d}_mock_lalinference.prior -g ~/GWTC-1_sample_release/ -o ${d}
done

for d in GW151226; do
 echo ${d};
 python produce_reweighted_lal_samples_BBH.py -e ${d} -p ~/bilby_pipe/bilby_pipe/data_files/8s.prior -l mock_lalinference_priors/${d}_mock_lalinference.prior -g ~/GWTC-1_sample_release/ -o ${d}
done

for d in GW170608; do
 echo ${d};
 python produce_reweighted_lal_samples_BBH.py -e ${d} -p ~/bilby_pipe/bilby_pipe/data_files/16s.prior -l mock_lalinference_priors/${d}_mock_lalinference.prior -g ~/GWTC-1_sample_release/ -o ${d}
done

for d in GW170729 GW170823; do
 echo ${d};
 python produce_reweighted_lal_samples_BBH.py -e ${d} -p ~/bilby_pipe/bilby_pipe/data_files/high_mass.prior -l mock_lalinference_priors/${d}_mock_lalinference.prior -g ~/GWTC-1_sample_release/ -o ${d}
done

for d in GW170817; do
 echo ${d};
 python produce_reweighted_lal_samples_BNS.py -e ${d} -p /home/gregory.ashton/public_html/bilby_review/bilby0.6.7-2847f983-CLEAN_bilby_pipe0.3.11-3330984-CLEAN/GW170817/run_setting_files/fixed_sky_lowspin_GW170817.prior -l mock_lalinference_priors/${d}_mock_lalinference.prior -g ~/GWTC-1_sample_release/ -o ${d}
done
