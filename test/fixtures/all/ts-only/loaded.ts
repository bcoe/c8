export default function getString(i){
  if (typeof i === 'number'){
    if (isNaN(i)){
      return 'NaN'
    }
    else if (i === 0){
      return 'zero'
    }
    else if (i > 0){
      return 'positive'
    }
    else {
      return 'negative'
    }
  }
  else {
    return 'wat?'
  }
}