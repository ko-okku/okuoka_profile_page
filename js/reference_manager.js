function convert_bib(paper, jmode, paper_count) {
  var text = "";

  if (paper.Type == "Journal" || paper.Type == "Other") {
    text += "@article{";
  } else {
    text += "@inproceedings{";
  }

  // title
  var title_txt;
  if (paper.Lang == "Japanese") {
    if (jmode || paper.Title.English.length == 0) {
      title_txt = "  title={" + paper.Title.Japanese + "},\n";
    } else {
      title_txt = "  title={" + paper.Title.English + "},\n";
    }
  } else {
    title_txt = "  title={" + paper.Title + "},\n";
  }

  // author
  var author_txt = "  author={";
  var first_author;
  if (paper.Lang == "Japanese") {
    if (jmode) {
      first_author = paper.Authors[0].Japanese.LastName;
      paper.Authors.forEach(author => {
        author_txt += author.Japanese.LastName + ", " + author.Japanese.FirstName + " and ";
      });
    } else {
      first_author = paper.Authors[0].English.LastName;
      paper.Authors.forEach(author => {
        author_txt += author.English.LastName + ", " + author.English.FirstName + " and ";
      });
    }
  } else {
    first_author = paper.Authors[0].LastName;
    paper.Authors.forEach(author => {
      author_txt += author.LastName + ", " + author.FirstName + " and ";
    });
  }

  author_txt = author_txt.slice(0, -5) + "},\n";

  // year
  var year_txt = "  year={" + paper.PublishedDate.Year + "},\n";
  
  // refername
  var refername = first_author + paper.PublishedDate.Year;
  if ("DOI" in paper) {
    var doi = paper.DOI.match(RegExp('https://doi.org/.+/(.+)$'));
    if (doi != null) {
      refername += "_" + doi[1];
    } else {
      refername += "paper" + paper_count;
    }
  } else {
    refername += "paper" + paper_count;
  }

  text += refername + "\n";
  text += title_txt + author_txt + year_txt;

  // journal, booktitle
  if (paper.Type == "Journal") { // Journal
    if (paper.Lang == "Japanese") {
      if (jmode || paper.Journal.English.length == 0) {
        text += "  journal={" + paper.Journal.Japanese + "},\n";
      } else {
        text += "  journal={" + paper.Journal.English + "},\n";
      }
    } else {
      text += "  journal={" + paper.Journal + "},\n";
    }
  } else { // Conference
    if (paper.Lang == "Japanese") {
      if (jmode || paper.BookTitle.English.length == 0) {
        text += "  booktitle={" + paper.BookTitle.Japanese + "},\n";
      } else {
        text += "  booktitle={" + paper.BookTitle.English + "},\n";
      }
    } else {
      text += "  booktitle={" + paper.BookTitle + "},\n";
    }
  }

  // pages
  if ("Pages" in paper) {
    text += "  pages={" + paper.Pages + "},\n";
  }

  // volume
  if ("Volume" in paper) {
    text += "  volume={" + paper.Volume + "},\n";
  }

  // number
  if ("Number" in paper) {
    text += "  number={" + paper.Number + "},\n";
  }

  // doi
  if ("DOI" in paper) {
    text += "  url={" + paper.DOI + "},\n";
    var doi = paper.DOI.match(RegExp('https://doi.org/(.+)$'));
    if (doi != null) {
      text += "  doi={" + doi[1] + "},\n";
    }
  }

  text = text.slice(0, -2); // 最後のカンマを削除
  text += "\n}";
  return text;
}


function getBibtex(jmode=false) {
  var bibtex_text = "";
  var paper_count = 0;
  for (var target of ["journal", "international_conf", "domestic_conf", "other_papers"]) {
    if (($("#title").data("lang") != "Japanese") && target == "domestic_conf") {
      continue;
    }

    obj = load_data(target);

    obj.Papers.forEach(element => {
      paper_count++;
      bibtex_text += convert_bib(element, jmode, paper_count) + "\n\n";
    });
  }

  const blob = new Blob([bibtex_text], { type: 'text/plain' });

  var link = document.createElement( 'a' );
  link.href = URL.createObjectURL(blob);
	link.download = "reference.bib";
	link.click();

  return;
}