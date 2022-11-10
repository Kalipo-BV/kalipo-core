tmp=$(mktemp)
jq '.forging.delegates = input' config/default/config.json config/default/forging_info.json > "$tmp" && mv "$tmp" config/default/config.json
jq '.forging += input' config/default/config.json config/default/password.json > "$tmp" && mv "$tmp" config/default/config.json
rm -r ~/.lisk/kalipo