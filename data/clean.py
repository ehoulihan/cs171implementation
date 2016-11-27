import csv 

filename = "freemansbridgecrests.txt"

f = open(filename)
# read away the header
height = []
date = []
f.readline()
for line in f:
	data = line.split()
	height += [data[1]]
	date += [data[4]]
	
csv_file = open("crests.csv", "w")
try:
	writer = csv.writer(csv_file)
	writer.writerow(("Gage Height (ft)", "Date"))
	for h, d in zip(height, date):
		writer.writerow((h,d))
finally:
	f.close()
	csv_file.close()
	
