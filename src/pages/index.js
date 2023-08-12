import Image from "next/image";
import styles from "./../styles/recipe_generator.module.css";

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
    console.log(event);

    try {
      document.getElementById("listofitems").innerHTML = "";
      document.getElementById("ntucitems").innerHTML = "";

      var input = getInput();
      console.log(input);
      if (input === null || input.match(/^ *$/) !== null) {
        alert("Error! Please enter something in the prompt.");
        return;
      }
      input +=
        ".Give me a shopping list and recipes in Singapore supermarket with 1 weight per item. List items with - and weight in (). Recipes should have instructions on how to make the food. I only want 1 shopping list.";
      const loader = document.querySelector("#loader");
      loader.style.display = "block";
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
      console.log("1");
      const itemsToDisplay = await fetch("/api/getNtuc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shoppingList: shoppingList }),
      });
      console.log("2");
      var shoppingData = await itemsToDisplay.json();
      shoppingData = JSON.parse(shoppingData.result);
      console.log("done");
      console.log(shoppingData[0]);
      console.log(shoppingData[0][1]);

      for (let a = 0; a < shoppingData.length; a++) {
        if (
          shoppingData[a][0] == null ||
          shoppingData[a][1] == null ||
          shoppingData[a][2] == null ||
          shoppingData[a][3] == null
        ) {
          continue;
        }
        console.log("in loop");
        document.getElementById("ntucitems").innerHTML +=
          '<div style = "border-style: solid;border-width: medium;"><img width="320" height="320" src = "' +
          shoppingData[a][0] +
          '"/><a href = "https://www.fairprice.com.sg' +
          shoppingData[a][1] +
          '" target="_blank"' +
          "><h3>" +
          shoppingData[a][2] +
          "</h3></a>" +
          "<p>" +
          shoppingData[a][3] +
          "</p></div>";
      }

      document.getElementById("listofitems").innerHTML = data.result;

      console.log("Render finish");

      loader.style.display = "none";

      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function getShoppingList(data) {
    var shoppingList;

    for (let i = 0; i < data.result.length - 6; i++) {
      // Print character at ith index
      if (
        data.result[i] == "R" &&
        data.result[i + 1] == "e" &&
        data.result[i + 2] == "c" &&
        data.result[i + 3] == "i" &&
        data.result[i + 4] == "p" &&
        data.result[i + 5] == "e"
      ) {
        console.log(i);
        console.log(data.result.substring(16, i));
        shoppingList = data.result.substring(0, i);
        break;
      }
    }
    var currentItem;
    var isCurr = false;
    const result = [];
    var index = 0;
    for (let j = 0; j < shoppingList.length; j++) {
      if (shoppingList[j] == "-") {
        isCurr = true;
        if (currentItem != undefined) {
          result[index] = currentItem;
          index++;
        }
        console.log(currentItem);
        currentItem = "";
        continue;
      }
      if (shoppingList[j] == "\n") {
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

  function fillInput1() {
    document.getElementById("first").value = "I want to host a party for five";
  }
  function fillInput2() {
    document.getElementById("first").value =
      "I want a mexican inspired party for two";
  }
  function fillInput3() {
    document.getElementById("first").value =
      "I want to cook for my family of four";
  }
  function copy() {
    // Get the text field
    var copyText = document.getElementById("listofitems");

    console.log(copyText.innerHTML);

    if (copyText.innerHTML == "") {
      alert("Nothing to copy! Please enter prompt first.");
      return;
    }

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.innerHTML);

    // Alert the copied text
    alert("Copied the Recipe!");
  }

  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <h1>Recipe Generator</h1>
      </div>
      <div>
        <h2 className={styles.recipeheading}>
          Welcome to the recipe generator!
        </h2>
      </div>
      <div>
        <form action="/send-data-here" method="post">
          <label className={styles.input}>Input:</label>
          <input
            type="text"
            id="first"
            name="first"
            className={styles.inputBox}
            placeholder="Type here or select the suggested prompts below..."
          />
          <button
            type="submit"
            className={styles.submitButton}
            onClick={onSubmit}
          >
            Submit
          </button>
        </form>
      </div>
      <div id="loader" className={styles.loader}>
        Loading...
      </div>
      <div className={styles.input}>
        <h3>Suggested:</h3>
        <button className={styles.submitButton} onClick={fillInput1}>
          I want to host a party for five
        </button>
        <button className={styles.submitButton} onClick={fillInput2}>
          I want a mexican inspired party for two
        </button>
        <button className={styles.submitButton} onClick={fillInput3}>
          I want to cook for my family of four
        </button>
      </div>
      <div id="recommendeditems" className={styles.recommendeditems}>
        <h3>Recommended Items:</h3>
        <p id="listofitems" className={styles.listofitems}></p>
        <div id="copytoclipboard">
          <button className={styles.submitButton} onClick={copy}>
            Copy to Clipboard
          </button>
        </div>
      </div>
      <div className={styles.clickitem}>
        <h2>Click on each item to find out more</h2>
        <div id="ntucitems" className={styles.ntucitems}></div>
      </div>
      <div className={styles.buynowbutton}>
        <a href="https://www.fairprice.com.sg/" target="_blank">
          <button className={styles.submitButton}>Buy on NTUC now!</button>
        </a>
      </div>
      <div>
        <p>
          Disclaimer: Items might not be accurate, please exercise discretion
          when using this application.
        </p>
        <p>
          Proudly developed by: Ma Yuanxin. View my resume at:{" "}
          <a
            href="https://mayuanxin1234.github.io/resumewebsite/"
            target="_blank"
          >
            https://mayuanxin1234.github.io/resumewebsite/
          </a>
        </p>
      </div>
    </main>
  );
}
