import Image from 'next/image';
import styles from './../styles/recipe_generator.module.css';

export default function generator() {

    // Get the user input
    function getInput() {
        const input = document.getElementById("first").value;
        document.getElementById("first").value = "";
        return input;
    }

    // Call api when submit button clicked
    async function onSubmit(event) {
        event.preventDefault();
        
        try {
          document.getElementById("listofitems").innerHTML = '';
          document.getElementById("ntucitems").innerHTML = '';
          const loader = document.querySelector('#loader')
          loader.style.display = 'block';
          const input = getInput() + ".Give me a shopping list and recipes in Singapore supermarket with 1 weight per item. List items with - and weight in (). Recipes should have instructions on how to make the food. I only want 1 shopping list.";
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: input }),
          });
          
          
    
          const data = await response.json();
          // simply print out the result in the console
          
          
          console.log(data.result);
          const shoppingList = getShoppingList(data);
          console.log("1")
          const itemsToDisplay = await fetch('/api/getNtuc', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ shoppingList: shoppingList }),
          });
          console.log("2")
          var shoppingData = await itemsToDisplay.json()
          shoppingData = JSON.parse(shoppingData.result)
          console.log("done")
          console.log(shoppingData[0])
          console.log(shoppingData[0][1])

          for (let a = 0; a < shoppingData.length; a++) {
            if (shoppingData[a][0] == null || shoppingData[a][1] == null || shoppingData[a][2] == null || shoppingData[a][3] == null) {
              continue;
            }
            console.log("in loop")
            document.getElementById("ntucitems").innerHTML +=
            '<div style = "border-style: solid;border-width: medium;"><img src = "' + shoppingData[a][0] + '"/><a href = "https://www.fairprice.com.sg' + shoppingData[a][1] + '"><h3>' + shoppingData[a][2] + '</h3></a>' + '<p>' + shoppingData[a][3] + '</p></div>'
          }

          document.getElementById("listofitems").innerHTML = data.result;

          console.log("Render finish")

          loader.style.display = 'none';
          

          
          
          
          if (response.status !== 200) {
            throw data.error || new Error(`Request failed with status ${response.status}`);
          }

        } catch(error) {
          console.error(error);
          alert(error.message);
        }
    }

    function getShoppingList(data) {
      var shoppingList;

          for(let i = 0; i < data.result.length - 6; i++){
            // Print character at ith index
            if (data.result[i] == 'R' &&
                data.result[i + 1] == 'e' &&
                data.result[i + 2] == 'c' &&
                data.result[i + 3] == 'i' &&
                data.result[i + 4] == 'p'&&
                data.result[i + 5] == 'e') {
                  console.log(i);
                  console.log(data.result.substring(16, i));
                  shoppingList = data.result.substring(0 , i);
                  break;
                }            
            }
          var currentItem;
          var isCurr = false;
          const result = [];
          var index = 0;
          for (let j = 0; j < shoppingList.length; j++) {
            if (shoppingList[j] == '-') {
                isCurr = true;
                if (currentItem != undefined) {
                  result[index] = currentItem;
                  index++;
                }
                console.log(currentItem);
                currentItem = "";
                continue;
            }
            if (shoppingList[j] == '\n') {
              continue;
            }
            if (isCurr) {
              currentItem += shoppingList[j];
            }
            
          }
          if (currentItem != "") {
            result[index] = currentItem;
          } 
          return result;  
    }


    return (
        <main className={styles.main}>
        <div className={styles.heading}>
          <h1>Recipe Generator</h1>
        </div>
        <div>
          <h2 className={styles.recipeheading}>Welcome to the recipe generator!</h2>
        </div>
        <div>
        <form action="/send-data-here" method="post">
          <label className={styles.input}>Input:</label>
          <input type="text" id="first" name="first" className = {styles.inputBox} 
          placeholder = "Type here or select the suggested categories below..."/>
          <button type="submit" className={styles.submitButton} onClick={onSubmit}>Submit</button>
        </form>
          </div>
          <div id='loader' className={styles.loader} >Loading...</div>
          <div className = {styles.input}>
          <h3>Suggested:</h3>
          <button className = {styles.submitButton}>Party</button>
          <button className = {styles.submitButton}>Meal-Prep</button>
          <button className = {styles.submitButton}>Family Cooking</button>
          </div>
          <div>
          <h3>Recommended Items:</h3>
          <p id ='listofitems' className={styles.listofitems}></p>
          </div>
          <div>
          <h2>Click on each item to find out more</h2>
          <div id = 'ntucitems' className={styles.ntucitems}></div>
        </div>
        <div>
          <button className = {styles.submitButton} >Buy on NTUC now!</button>
        </div>
      </main>
    );
};