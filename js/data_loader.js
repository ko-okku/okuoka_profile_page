function load_data(name) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', `./res/${name}.json`, false);
  try {
    xhr.send();
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    } else {
      return JSON.parse(xhr.responseText);
    }
  } catch(err) { 
    console.log("Request failed");
  }
  return null;
}


function format_author(data) {
  var text = "";
  var authors = [];
  for(var author of data.Authors) {
    let name = "";
    
    if(data.Lang == "Japanese" && $("#title").data("lang") == "Japanese") {
      name += author.Japanese.LastName + " ";
      name += author.Japanese.FirstName;
      authors.push(name);
      continue;
    }

    let author_data = author;
    if (data.Lang == "Japanese") {
      author_data = author.English;
    }

    name += author_data.FirstName + " ";
    name += author_data.LastName;
    authors.push(name);
  }

  text += authors.join(", ");
  return text;
}


function format_title(data) {
  if(data.Lang == "Japanese"){
    if ($("#title").data("lang") == "Japanese"){
      return data.Title.Japanese;
    } else {
      if (data.Title.English.length > 0) {
        return data.Title.English;
      }
      console.log("English title in the japanese paper does not exist.");
    }
  } else {
    return data.Title;
  }
  
  return null;
}


function format_publish(data) {
  var text = "";
  var isFuture = false;

  // Date
  if ("PublishedDate" in data) {
    let date = new Date(data.PublishedDate.Year, data.PublishedDate.Month - 1, data.PublishedDate.Day);
    let now = new Date();
    if (now < date) { // Future publish
      console.log("Future data");
      return null;
    }
    if (data.Lang == "Japanese" && $("#title").data("lang") == "Japanese"){
      text += `${date.getFullYear()}年${date.getMonth() + 1}月, `;
    } else {
      const months = ["January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"];
      text += `${months[date.getMonth()]} ${date.getFullYear()}, `;
    }
  }

  // Publisher
  var publisher;
  if("Journal" in data) {
    publisher = data.Journal;
  } else {
    publisher = data.BookTitle;
  }

  if(data.Lang == "Japanese"){
    if ($("#title").data("lang") == "Japanese"){
      if ("ConferenceName" in data) {
        text += data.ConferenceName + ", ";
      } else {
        text += `${publisher.Japanese}, `;
      }
    } else {
      if (publisher.English.length > 0) {
        text += `${publisher.English}, `;
      } else {
        console.log("English publisher name in the japanese paper does not exist.");
        return null;
      }
    }
  } else {
    text += `${publisher}, `;
  }

  // Pages
  if ("Volume" in data) {
    text += `Vol.${data.Volume}, `;
  }

  if ("Number" in data) {
    text += `No.${data.Number}, `;
  }

  if ("Pages" in data) {
    if (data.Pages.indexOf("-") < 0) {
      text += `p.${data.Pages}, `;
    } else {
      text += `pp.${data.Pages}, `;
    }
  } else {
    if ("PresentationID" in data) {
      text += `${data.PresentationID}, `;
    }
  }

  // Locate
  if (["Journal", "Other"].indexOf(data.Type) == -1) {
    if(data.Venue == "Online") {
      if (data.Lang == "Japanese" && $("#title").data("lang") == "Japanese"){
        text += "オンライン開催, ";
      } else {
        text += "Online, ";
      }
    } else {
      if(data.Type == "DomesticConference") {
        text += `${data.City}, `;
      } else {
        text += `${data.Country}, `;
      }
    }
  }


  if("DOI" in data) {
    text += `<a href="${data.DOI}">${data.DOI}</a>`;
  } else {
    text = text.slice(0, -2); // Remove comma
  }
  return text + ".";
}

function format_paper(data){
  var text = "";
  text += format_author(data) + ", ";
  let title = format_title(data);
  if (title == null) {
    console.log("The data of title is invalid.");
    console.log(data);
    return null;
  }
  text += `"${title}", `;

  let pub_data = format_publish(data);
  if (pub_data == null) {
    console.log("The data of publication is invalid.");
    console.log(data);
    return null;
  }
  text += `${pub_data}`;

  return text;
}


window.addEventListener('DOMContentLoaded', function(){
  var latest_date = new Date(2000);
  for (var target of ["journal", "international_conf", "domestic_conf", "other_papers"]) {
    if (($("#title").data("lang") != "Japanese") && target == "domestic_conf") {
      continue;
    }

    var obj = load_data(target);
    let date = new Date(obj.UpdateDate);
    if (latest_date < date) {
      latest_date = date;
    }

    obj.Papers.sort(function(a, b) {
      let a_date = new Date(`${a.PublishedDate.Year}-${a.PublishedDate.Month}-${a.PublishedDate.Day}`);
      let b_date = new Date(`${b.PublishedDate.Year}-${b.PublishedDate.Month}-${b.PublishedDate.Day}`);
      return (a_date < b_date) ? 1 : -1;
    });
    if (obj != null) {
      for(var data of obj.Papers) {
        let text = format_paper(data);
        if(text != null) {
          $(`#${target}_list`).append(`<li><p>${text}</p></li>`);
        }
      }
    }
  }

  $("#LastUpdate").text(`${latest_date.getFullYear()}/${latest_date.getMonth()+1}/${latest_date.getDate()}`);
  
});

