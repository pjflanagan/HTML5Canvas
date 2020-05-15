
if __name__ == "__main__":

  piFile = open('full/pi.txt' , 'r')
  pi = piFile.read()
  piFile.close()

  print ('Read Pi')

  # get rid of non number digits
  numbers = ['1','2','3','4','5','6','7','8','9','0']
  n = 1
  piSplit = [pi[i:i+n] for i in range(0, len(pi), n)]
  for item in piSplit:
    if item not in numbers:
      piSplit.pop(piSplit.index(str(item)))
    else:
      pass

  print ('Cleaned Pi from nonsense')

  # reset pi and then add it back together with only numbers
  pi = ''
  for item in piSplit:
    pi += item

  print ('Reset Pi into string')

  # split every 6 digits of pi
  n = 6
  piSplit = [pi[i:i+n] for i in range(0, len(pi), n)]

  print ('Divided Pi into six')

  # cut array to make file smaller to the number of pixels
  pixels = 8000
  piSplit[pixels:len(piSplit)] = []

  print ('Cut Pi array to size')

  # write text to file "w" means erase contents
  smallPi = open("small/pi.txt", "w")
  for item in piSplit:
    smallPi.write(str(item) + '\n')
  smallPi.close()

  print ('Saved file')