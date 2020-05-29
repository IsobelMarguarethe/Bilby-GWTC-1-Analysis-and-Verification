/*Script taken from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/ */

function download_shell(command, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([command], {type: "text/plain"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function export_table_to_shell(filename) {
	var csv = [];
        var commands = document.getElementsByClassName("highlight")

    download_shell(commands[0].innerText.replace(/\n/g, ''), filename);
}
