var dataBox = new Array();
var dataKind = "";
// SPARQL 検索を行う query() 関数を定義
function query() {
  // HTML ページの <input id="endpoint" type="text"> から値を取得
  var endpoint = $("#endpoint").val()

  // HTML ページの <textarea id="sparql"> から値を取得
  var prefType = $('#words').val();
  dataKind = prefType;
  var sparql = "PREFIX dbpedia-owl:  <http://dbpedia.org/ontology/>\n"+
               "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
               "PREFIX category-ja: <http://ja.dbpedia.org/resource/Category:>\n"+
               "select distinct ?pref (count(?s) AS ?c) where {\n"+
               "  ?pref rdf:type dbpedia-owl:Place.\n"+
               "  ?pref dbpedia-owl:wikiPageWikiLink category-ja:日本の都道府県.\n"+
               "  ?s rdf:type dbpedia-owl:"+prefType+";\n"+
               "      dbpedia-owl:birthPlace ?pref.\n"+
               "}GROUP BY ?pref\n"+
               "ORDER BY ?c";
  console.log(sparql);　//投げられているquery
  // AJAX により SPARQL クエリを実行
  $.ajax({
    // SPARQL 検索を呼び出す URL の指定
    url: endpoint + "?query=" + encodeURIComponent(sparql),
    // 結果を JSON 形式で取得するための指定
    dataType: "json",
  }).done(function(data){ // コールバック関数
    // 返ってきた結果をrender 関数に渡す指定
    render(data);
  })
}

// SPARQL 検索結果の表示を行う render() 関数を定義
function render(json) {
  // SPARQL 検索の結果の JSON をデバッグ用にコンソールへ表示
  console.log(json)
  //dataBoxの初期化
  dataBox = [];
  // HTML の表を生成（クラスは Bootstrap 用のデザイン指定）
  var table = $("<table>").addClass("table table-bordered table-hover")
  // SPARQL 検索の変数名を表のヘッダに表示
  var vars = json.head.vars
  var arrayY = 0;
      
  var row = $("<tr>")
  $.each(vars, function() {
    row.append($("<th>").text(this))
  })
  table.append(row)
    
  // SPARQL 検索の結果を１件ずつ表の行に追加
  $.each(json.results.bindings, function(i, item) {
    var row = $("<tr>")
    //console.log('arrayY['+arrayY+']');
    //console.log(count);
    var arrayX = 0;
    dataBox[arrayY] = [];
    $.each(vars, function() {
      if (item[this] && item[this].value) {
        row.append($("<td>").text(item[this].value));
        //console.log(item[this].value);
        dataBox[arrayY][arrayX] = item[this].value;
        
        //console.log('arrayX['+arrayX+']');
        //console.log(1);
        arrayX = arrayX + 1;
      } else {
        row.append($("<td>").text(""));
      }
        
    })
    arrayY = arrayY + 1;
    table.append(row)
  })
    
  // 完成した表を HTML に差し込む（cssは結果表示の幅）
  $("#result").html(table).css('width','620px');
  setTimeout(function(){
    for(var i = 0; i < arrayY; i++){
    var string = dataBox[i][0];
    var m = string.match(/[一-龠]/);　//漢字にマッチしたら
    //console.log(m);
    //都道府県をGoogle　APIで使えるように変更
      if(string.indexOf(m)>=0){
        var str1=string.substring(string.indexOf(m),string.length);
        var str1=str1.replace(/県/g, "");
        var str1=str1.replace(/府/g, "");
        if(str1 != "京都"){
            var str1=str1.replace(/都/g, "");
        }
      }
    dataBox[i][0] = str1;
    }
  console.log(dataBox);
  drawGeoMap_2();
  },100);
}

google.load("visualization", "1", {packages: ["geomap"]}); 

function drawGeoMap_2() { 
  var data = new google.visualization.DataTable(); 
  data.addRows(47); 
   
  data.addColumn("string", "都道府県名（英語表記）"); 
  data.addColumn("number", dataKind); 
  data.addColumn("string", "都道府県名"); 
  for(var i = 0; i < dataBox.length; i++){
      var prefName = dataBox[i][0];
      var number = +dataBox[i][1];
      data.addRow([prefName,number,prefName]);
  }
  var options = {}; 
  options['dataMode'] = 'regions'; 
  options['region'] = "JP"; 
  var container = document.getElementById("geomap"); 
  var geomap = new google.visualization.GeoMap(container); 
  geomap.draw(data, options); 
} 