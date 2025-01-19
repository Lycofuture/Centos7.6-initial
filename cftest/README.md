```bash
cat txt/*.txt | sort | uniq > list.txt
```

```bash
 ./CloudflareST -n 50 -dn 9999999 -tp 443 -url https://speed.cloudflare.com/__down?bytes=500000000 -tlr 0 -f list.txt
```
