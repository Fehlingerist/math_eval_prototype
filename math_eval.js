import { assert } from "node:console";

let index = 0;
let expression = "";

function is_end()
{
 return index >= expression.length;
};

function advance()
{
 index++;
};

function advance_ex()   
{
 //debugger
 let current_char = see_current();
 while (current_char !== '\0') {
  if (current_char !== ' ' && current_char !== '\n')
  {
    break;
  }
  index++;
  current_char = see_current();
 }
};

function see_current()
{
 if (index == expression.length)
 {
    return '\0';
 };
 return expression[index];
};

function is_numeric_char(char)
{
 switch (char) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9': 
        return true; 
    default:
        return false;
 }
};

function is_additive_operator(char)
{
 switch (char) {
    case '+':
    case '-':
        return true;
    default:
        return false;
 }
};

function is_multiplicative_operator(char)
{
 switch (char) {
    case '*':
    case '/':
        return true;
    default:
        return false;
 }
};

function is_operator(char)
{
 return is_additive_operator(char) || is_multiplicative_operator(char);
};

function is_primary_symbol(symbol_char)
{
    return (symbol_char == '(' || symbol_char == ')');
};

function eval_integer()
{
    let integer = 0;
    let current_char = see_current();
    while (is_numeric_char(current_char))
    {
        advance();
        integer *= 10;
        integer += parseInt(current_char);
        current_char = see_current();
    };

    return integer;
};

function eval_fraction()
{
 let current_char = see_current();
 let integer = 0;
 let divisor = 1;

 while (is_numeric_char(current_char))
 {
    advance();
    divisor *= 10;
    integer *= 10;
    integer += parseInt(current_char);
    current_char = see_current();
 };

 return integer / divisor;
};

function eval_number()
{
 let number = eval_integer();
 
 if (see_current() == '.')
 {
    advance();
    number += eval_fraction();
 };

 return number;
};

function eval_subexpression()
{
    advance_ex();
    let number = 0;
    let n_factor = 1;

    let current_char = see_current();

    if (current_char == '-')
    {
        advance();
        current_char = see_current();
        n_factor = -1;
    };

    if (is_numeric_char(current_char))
    {
        number = eval_number();
    } else if(current_char == '(') {
        number = eval_local_expression();
    } else {
        throw SyntaxError("Unexpected character");
    };
    return number * n_factor;
};

function check_next_operator()
{
    advance_ex();
    let current_char = see_current();

    if (!is_operator(current_char))
    {
        return null;
    };

    return current_char;
};

function check_next_additive_operator()
{
    let next_operator = check_next_operator();

    if (!is_additive_operator(next_operator))
    {
        return null;
    };

    advance();
    return next_operator;
};

function check_next_multiplicative_operator()
{
    let next_operator = check_next_operator();

    if (!is_multiplicative_operator(next_operator))
    {
        return null;
    };

    advance();
    return next_operator;
};

function expect_subexpression()
{
    advance_ex();
    let current_char = see_current();
    let subexpression_value = 0;
    if (current_char == '-' || is_numeric_char(current_char) || current_char == '(')
    {
        subexpression_value = eval_subexpression();
    }  
    else {
        throw SyntaxError("Invalid token, expected number literal or subexpression, got something else");
    };

    return subexpression_value;
};

function eval_multiplicative_expression()
{
    let initial_number = expect_subexpression();
    let current_operator = check_next_multiplicative_operator();

    if (current_operator === null)//for now there are no higher precedence operators
    {
        return initial_number;
    }; 

    let output = initial_number;

    while(is_multiplicative_operator(current_operator)) 
    {
        let number = expect_subexpression();

        if (current_operator == '*')
        {
            output *= number;
        } else if(current_operator == '/')
        {
            output /= number;
        };

        current_operator = check_next_multiplicative_operator();
    };

    return output;
};

function eval_additive_expression()
{
    let initial_number = eval_multiplicative_expression();

    let add_sum = initial_number;
    let current_num = initial_number;

    while (see_current() != '\0')
    {
        let next_operator = check_next_additive_operator();

        if (next_operator === null)
        {
            break; //end of local expression
        }

        if(next_operator == '+' || next_operator == '-')
        {
            current_num = eval_multiplicative_expression();
            if (next_operator == '-')
            {
                current_num *= -1;
            };
        } else {
            throw new SyntaxError("Unexpected operator for addition layer");
        };

        add_sum += current_num;
    }
    return add_sum;
};

function eval_local_expression()
{
    let current_char = see_current();

    assert(current_char == '(',
        "unexpected char, expected ( got " + current_char
    );
    advance();

    let eval_val = eval_additive_expression();
    advance_ex();

    if (see_current() != ')')
    { 
     throw new SyntaxError("unclosed local expression");
    };
    advance();

    return eval_val;
};

function eval_expression(_expression)
{
 index = 0;
 expression = _expression;
 
 return eval_additive_expression();
};

export {
 eval_expression
};