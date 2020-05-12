# This script launches event-full-comparison.py for all BBH events and for the BNS event.

for d in GW150914 GW151012 GW151226 GW170104 GW170608 GW170809 GW170814 GW170818 GW170729 GW170823; do
  echo ${d};
  cd ${d};
  python ../event_full_comparison.py --event ${d};
  cp ${d}*.png ~/public_html/ppp-plots-colm-changes/;
  cd ../
done
echo 'GW170817'
cd GW170817
python ../event_full_comparison.py --event GW170817 --main_keys theta_jn chirp_mass mass_ratio luminosity_distance a_1 a_2 tilt_1 tilt_2 lambda_tilde delta_lambda_tilde --nsample 8000;
cp GW170817*.png ~/public_html/ppp-plots-colm-changes/;
cd ../
