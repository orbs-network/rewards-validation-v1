# Rewards Validation Script

This repo holds a script that assists with comparing rewards from a static set (a csv file) to the actual contract stored data.

## Merge script

This is a simple script that will merge several csv files into a single file. It takes as input the different past election files, and outputs a `merged.csv` file that will hold data from all of them combined, pivoted by the address of the participant (addresses which should be getting rewards)

That merged file should be later used for comaring against the contract.

## Compare script

This script takes a file holding the:
* address - the address that should get rewards
* firstDist - the first reward distribution data (Elections1-27)
* secondDist - the second reward distribution data (Elections28-55)
* pending - the third election data (what should be Elections56-82)


It can either give a diff output, or the expect value that we should distribute by.

It is expected that this is used in each reward distribution to validate the rewards, and will need to be updated to support it.