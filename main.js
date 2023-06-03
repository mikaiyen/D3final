d3.csv("data/test.csv").then(function(data) {
    console.log(data)
    // 資料預處理
    data.forEach(function(d) {
        d.Children = parseFloat(d.Children);
        d.Youth = parseFloat(d.Youth);
        d.Adult = parseFloat(d.Adult);
        d.Elderly = parseFloat(d.Elderly);
        // d.AgeGroup  = [+d.Children, +d.Youth, +d.Adult, +d.Elderly];
    });
 
    // 動態生成國家選項
    var countries = data.map(function(d) { return d.Country_Name; });
    var countrySelect = d3.select("#countrySelect");

    countrySelect.selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(function(d) { return d; });


    // 設定圓餅圖尺寸和位置
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var colors = d3.schemeCategory10;
 
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // 設定按鈕點擊事件處理函式
    d3.select("#countryBtn").on("click", function() {
        // 獲取選中的國家名稱
        var selectedCountry = d3.select("#countrySelect").property("value");

        console.log(selectedCountry)

        // 根據選中的國家過濾資料
        var filteredData = data.filter(function(d) {
            return d.Country_Name === selectedCountry;
        });

        console.log(filteredData)
 
        // var numdata = Object.keys(filteredData);
        // console.log(numdata)

        // 更新圓餅圖資料
        var pie = d3.pie()
            .value((d) => { return d.values }).sort(null);
            
        console.log("Children",filteredData[0].Children)

        var newdata = [
            { "values": filteredData[0].Children, "property": "Children" },
            { "values": filteredData[0].Youth, "property": "Youth" },
            { "values": filteredData[0].Adult, "property": "Adult" },
            { "values": filteredData[0].Elderly, "property": "Elderly" }
        ]

        // var newdata = [
        //     { "values": 1, "property": "Children" },
        //     { "values": 2, "property": "Youth" },
        //     { "values": 3, "property": "Adult" },
        //     { "values": 4, "property": "Elderly" }
        // ]
    
        var dataReady = pie(newdata);
 
        console.log(dataReady)

        // 移除之前的圓餅圖
        svg.selectAll('path').remove();


        // 建立弧形生成器
        var arcGenerator = d3.arc()
            .innerRadius(0)
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
        .each(function(d) {
            var centroid = arcGenerator.centroid(d);
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", centroid[0])
                .attr("y", centroid[1])
                .text(function() {
                    return d.data.property;
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


        //顯示國家資料
        document.getElementById("country_name").innerHTML = selectedCountry;

        document.getElementById("Children").innerHTML   = "Children : " + filteredData[0].Children*100  + "%";
        document.getElementById("Youth").innerHTML      = "Youth : "    + filteredData[0].Youth*100     + "%";
        document.getElementById("Adult").innerHTML      = "Adult : "    + filteredData[0].Adult*100     + "%";
        document.getElementById("Elderly").innerHTML    = "Elderly : "  + filteredData[0].Elderly*100   + "%";


    });

    //interactive 互動處理
    const tip = d3.select('.tooltip');

    function mouseover(e){ 
        //get data
        const thissliceData = d3.select(this); 
        console.log(thissliceData)
        const bodyData = [
            ['Budget', thissliceData.values]
        ];

        tip.style('left',(e.clientX+15)+'px')
            .style('top',e.clientY+'px') 
            .style('opacity',0.98) 

        tip.select('h3').html(`${thissliceData.title}, ${thissliceData.release_year}`); 
        tip.select('h4').html(`${thissliceData.tagline}, ${thissliceData.runtime} min.`);

        d3.select('.tip-body').selectAll('p').data(bodyData) 
        .join('p').attr('class', 'tip-info') 
        .html(d=>`${d[0]} : ${d[1]}`);
    }

    function mousemove(e){ 
        tip.style('left',(e.clientX+15)+'px')
            .style('top',e.clientY+'px')
            .style('opacity',0.98)
    }

    function mouseout(e){
        tip.style('opacity',0)
    }

    //interactive 新增監聽
    d3.selectAll('.pie')
        .on('mouseover',mouseover)
        .on('mousemove',mousemove) 
        .on('mouseout',mouseout);

});

 
