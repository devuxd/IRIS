#!/bin/bash

sites=( $(grep -o -E 'http://\w+\.com' moz.html) )
len=${#sites[@]}
html=".html"
for (( i=0; i<200; i++ ));
	do
		# echo "sites $i: '${sites[i]}'"
		url="${sites[i]}"
		fileName="$url$html"
		empty=""
		fileName=${fileName/./$empty}
		fileName=${fileName/:\/\//$empty}

		echo $url
		echo $fileName
		echo "$i"
		curl -L  $url >> $fileName --max-time 20
	done
exit 0

