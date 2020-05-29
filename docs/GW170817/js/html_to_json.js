/*Script modifed from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/ */

function download_json(data, filename) {
    var jsonFile;
    var downloadLink;

    jsonFile = new Blob([data], {type: "application/json"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(jsonFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function export_table_to_json(filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
                var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

                csv.push(row.join(","));
        }
    var result = [];
    var data = csv.join("\n")
    var lines=data.split("\n");
    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }

      result.push(obj);

  }
    var myJsonString = JSON.stringify(result);
    download_json(myJsonString, filename);
}
