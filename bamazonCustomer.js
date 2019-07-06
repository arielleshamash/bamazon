var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Munchkin93",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id: " + connection.threadId);
  // run the start function after the connection is made to prompt the user
  start();
});

function start() {
  // query the database for all items being auctioned
  connection.query("SELECT item_id, product_name, price FROM products", function(err, results) {
    if (err) throw err;
    console.log("Item ID   Product  Price");
      for (var i = 0; i < results.length; i++) {
      console.log(results[i].item_id, results[i].product_name, results[i].price);
      };
    
    // once you have the items, prompt the user for which they'd like to purchase
    inquirer
      .prompt([
        // {
        //   name: "productlist",
        //   type: "list",
        //   choices: function() {
        //     var choiceArray = [];
        //     for (var i = 0; i < results.length; i++) {
        //       choiceArray.push(results[i].item_id, results[i].product_name, results[i].price);
        //     }
        //     return choiceArray;
        //   },
        //   message: "What item would you like to purchase?"
        // },
        {
          name: "selection",
          type: "list",
          message: "Which item would you like to buy?",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          }
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to purchase?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name == answer.choice) {
            var chosenItem = results[i];
            var chosenStock = results[i].stock_quantity;
            var chosenPrice = results[i].price;
          }
        }

        //subtract user's purchase from stock quantity
        var updateQuantity = parseInt(chosenStock) - parseInt(answer.quantity);

        //if user requests to purchase more than available quantity
        if (chosenStock < parseInt(answer.quantity)) {
          console.log("Insufficient quantity!");
        }
        else {
          var totalCost = (parseFloat(answer.quantity) * chosenPrice);
          console.log("Thank you for your purchase! Your total is $" + totalCost);

          var query = connection.query("UPDATE Products SET ?, WHERE ?", [{stock_quantity: updateQuantity}, {item_id: chosenItem.item_id}], function (err, results) {
            if (err) throw err;
            console.log("Database updated successfully.");
          });

        }

       
      });
  });
}
