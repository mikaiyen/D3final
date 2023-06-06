d3.csv("data/World_Bank_labol_force_data.csv").then(
    res=>{
        ready(res)
    }
)

function ready(rawdata){
    data=preprocess(rawdata);
    btninit(data);
    btnclick(data);
}


function preprocess(data){
    data.forEach(function(d) {
        d.Country_Name = d['Country Name'];
        d.Children = parseFloat(d['Children, aged 0-14']);
        d.Youth = parseFloat(d['Youth, aged 15-24']);
        d.Adult = parseFloat(d['Adult, aged 25-64']);
        d.Elderly = parseFloat(d['Elderly, aged 65+']);
    });
    console.log(data)
    return data;
}

function btninit(data){
    // 動態生成國家選項
    var countries = data.map(function(d) { return d.Country_Name; });
    var countrySelect = d3.select("#countrySelect");

    countrySelect.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; });
}




function btnclick(data){
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var colors    = ['#FF8C8C','#8CFF8C','#8CFFFF','#CE8CFF'];
    colors=colors.concat(d3.schemeCategory10);  //免得顏色不夠用
 
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    // 設定按鈕點擊事件處理函式
    d3.select("#countryBtn").on("click", click);

    function click() {
        // 獲取選中的國家名稱
        var selectedCountry = d3.select("#countrySelect").property("value");


        // 根據選中的國家過濾資料
        var filteredData = data.filter(function(d) {
            return d.Country_Name === selectedCountry;
        });

        // 更新圓餅圖資料
        var pie = d3.pie()
            .value((d) => { return d.values }).sort(null);
            

        var newdata = [
            { "values": filteredData[0].Children, "property": "Children" },
            { "values": filteredData[0].Youth, "property": "Youth" },
            { "values": filteredData[0].Adult, "property": "Adult" },
            { "values": filteredData[0].Elderly, "property": "Elderly" }
        ]

        var dataReady = pie(newdata);

        // 移除之前的圓餅圖和文字
        svg.selectAll('path').remove();
        svg.selectAll('text').remove();

        // 建立弧形生成器
        var arcGenerator = d3.arc()
            .innerRadius(radius/5)
            .outerRadius(radius);
    
    
        // 重新繪製圓餅圖
        svg.selectAll('slices')
        .data(dataReady)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function(d, i) { return colors[i]; })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", handleMouseOver) // 新增滑鼠移入事件處理器
        .on("mouseout", handleMouseOut) // 新增滑鼠移出事件處理器
        .on("mousemove", mousemove)
        .each(function(d) {
            var centroid = arcGenerator.centroid(d);
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", centroid[0])
                .attr("y", centroid[1])
                .attr("font-variant","small-caps")//字體
                .text(function() {
                    return d.data.property+': \r'+Math.floor((d.data.values*100))+"%"; //Math.floor()是因為有時候資料的小數點不知為啥會爆開
                });
        })
        .transition()
        .duration(800)
        .attrTween("d", function(d) {
            var startAngle = d.startAngle,
            endAngle = d.endAngle;
            var interpolate = d3.interpolate(startAngle, endAngle);
            return function(t) {
                d.endAngle = interpolate(t);
                return arcGenerator(d);
            };
        });

        //interactive 互動處理
        const tip = d3.select('.tooltip');


        // 滑鼠移入事件處理器
        function handleMouseOver(e) {
            const thisSliceData = d3.select(this).data()[0].data
            // console.log("Mouse over:", thisSliceData); // 在控制台中顯示相應的屬性
            
            tip.style('left',(e.clientX+15)+'px')
            .style('top',e.clientY+'px') 
            .style('opacity',0.98) 

            tip.select('h3').html(`${thisSliceData.property}`); 
            tip.select('h4').html(`${Math.floor((thisSliceData.values)*100)+"%"}`);

        
        }

        function mousemove(e){ 
            tip.style('left',(e.clientX+15)+'px')
                .style('top',e.clientY+'px')
                .style('opacity',0.98)
        }

        // 滑鼠移出事件處理器
        function handleMouseOut(d, i) {
            tip.style('opacity',0)
        }


        //顯示國家資料
        document.getElementById("country_name").innerHTML = selectedCountry;

        console.log(filteredData);


        document.getElementById("Children").innerHTML   = "Children (aged 0-14) : " + Math.floor(filteredData[0].Children*100)  + "%";
        document.getElementById("Youth").innerHTML      = "Youth    (aged 15-24): " + Math.floor(filteredData[0].Youth*100)     + "%";
        document.getElementById("Adult").innerHTML      = "Adult    (aged 25-64): " + Math.floor(filteredData[0].Adult*100)     + "%";
        document.getElementById("Elderly").innerHTML    = "Elderly  (aged 65+)  : " + Math.floor(filteredData[0].Elderly*100)   + "%";
    }

}


