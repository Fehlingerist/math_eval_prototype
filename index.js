const math_eval = require('./math_eval');
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


rl.question(`Write math expression? \n`, name => {

  try{
    let result = math_eval.eval_expression(name);
    console.log(result);
  } catch(E)
  {
    console.log("Exception was caught: ");
    console.log(E);
  }

  rl.close();
});