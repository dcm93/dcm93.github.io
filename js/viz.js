$(document).ready(function() {
    var data = [];
    Plotly.d3.csv('../data/antibiotics-data.csv', function(err, rows){
            rows.forEach((element) => {
                /**
                 * index
                 * 0    name
                 * 1    penicilin
                 * 2    streptomycin
                 * 3    neomycin
                 * 4    gram
                 */
                var row = {'name': element['Bacteria'], 'penicilin':+element['Penicilin'], 'streptomycin':+element['Streptomycin'], 'neomycin':+element['Neomycin'], 'gram':element['Gram.Staining']};
                data.push(row);
            });

        function unpackNum(rows, key){
            return rows.map(function(row){return +row[key];})
        }

        function assignPos(){
            var mapping = [];
            var pos = 0;
            var neg = 0;
            data.forEach((row)=>{
                var min = Math.min(row['penicilin'], row['streptomycin'], row['neomycin']);
                row['size'] = min;
                if(min === row['penicilin']){
                    row['effect'] = "Penicilin";
                } else if(min === row['streptomycin']){
                    row['effect']= "Streptomycin";
                } else if(min === row['neomycin']){
                    row['effect']= "Neomycin";
                }

                if(row['gram'] === "negative"){
                    neg--;
                    row['pos'] = neg;
                } else {
                    pos++;
                    row['pos'] = pos;
                }  
                mapping.push(row);
                mapping= _.sortBy(mapping, ['pos']);
            }); 
            return mapping;
        }

        function mostEffectiveAntib(rows){
            var mostEffective = rows.map(function(row){
                var min = Math.min(row[1], row[2], row[3]);
                if(min === row[1]){
                    return "Penicilin";
                } else if(min === row[2]){
                    return "Streptomycin";
                } else if(min === row[3]){
                    return "Neomycin";
                }
            })
            return mostEffective;
        }

          function scaler(rows, scale){
           var target = [];
            for(var i = 0; i < rows.length; i++){
                var currentSize = Math.log10(rows[i] + 3);
                target.push(currentSize);
            }
            return target;
       }

       function mapOut(type, mappingBubble){
           var result = [];
           var name = [];
           var position = [];
           var effect = [];
           var size = [];
           mappingBubble.map((row)=> {
               if(row['gram'] === type){
                   position.push(row['pos']);
                   effect.push(row['effect']);
                   size.push(row['size']);
                   name.push(row['name']);
               }

           });
           result.push(position, effect, size);
           return result;
       }



       var mappingBubble = assignPos(), 
        gramPos = mapOut("positive", mappingBubble),
        gramNeg = mapOut("negative", mappingBubble);

        var gramPosPosition = gramPos[0],
            mostEffectivePos = gramPos[1], 
            micSizePos = gramPos[2],
            scale = 1000,
            bubbleSizePos = scaler(micSizePos, scale);
        
        var gramNegPosition = gramNeg[0], 
            mostEffectiveNeg = gramNeg[1], 
            micSizeNeg = gramNeg[2], 
            scale = 100, 
            bubbleSizeNeg = scaler(micSizeNeg, scale);

        var xValues = mappingBubble.map(function(row){
            return row['pos'];
        }), 
        xLabels = mappingBubble.map(function(row){
            return row['name'];
        }); 

        var tracePos = {
            name:"Gram Positive",
            x:gramPosPosition, 
            y:mostEffectivePos,
            mode:'markers', 
            marker:{
                size: bubbleSizePos,
                color:'rgb(255,182,193)' 
            }
        };
        var traceNeg ={
            name:"Gram Negative",
            x:gramNegPosition, 
            y:mostEffectiveNeg, 
            mode:'markers', 
            marker:{
                size:bubbleSizeNeg,
                color:'rgb(138,43,226)' 
            }
        };
        var dataBubble = [tracePos, traceNeg];
        var layoutBubble = {
            title: 'Bacteria classification by Gram Staining & Most Effective Antibiotic Treatment', 
            showlegend:true,
            height:600, 
            width:600, 
            xaxis:{
                tickmode:'array', 
                tickvals: xValues,
                ticktext: xLabels, 
                tickfont:{
                    size:10
                }
            }
        }

        function counts(rows, type){
            var result = [0, 0, 0];
            rows.map(function(row){
                if(row['gram'] === type){
                if(row['effect'] === 'Penicilin'){
                    result[0] = result[0] + 1;
                } else if(row['effect'] === 'Streptomycin'){
                    result[1] = result[1] + 1;
                } else {
                    result[2] = result[2] + 1;
                }
            }
            });
            return result;
        }
        var countPos = counts(mappingBubble, "positive"),
        countNeg = counts(mappingBubble, "negative");
        var traceHorPos = {
            x:[4, 0, 3],
            y: ['Penicilin', 'Streptomycin', 'Neomycin'],
            name: 'Gram Positive',
            orientation: 'h',
            marker: {
                color: 'rgb(255,182,193)',
                width: 1
            },
            type: 'bar'
        };
     
        var traceHorNeg = {
            x: [0, 2, 7],
            y: ['Penicilin', 'Streptomycin', 'Neomycin'],
            name: 'Gram Negative',
            orientation: 'h',
            type: 'bar',
            marker: {
                color: 'rgb(138,43,226)',
                width: 1
            }, 
            type:'bar'
        };

        var dataBar=[traceHorNeg, traceHorPos];
        var layoutBar = {
            title:'Antibiotic Spectrum by Low MIC Count',
            barmode:'stack',
            xaxis: {
                title:'Count of Bacteria with Lowest MIC per Antibiotic'
           }
        };

      function MICByAntib(){
          var peni = [], 
              strep = [], 
              neo =[], 
              result =[];
          data.map(function(row){
              peni.push(row['penicilin']);
              strep.push(row['streptomycin']);
              neo.push(row['neomycin']);
          })
          result.push(peni, strep, neo);
          return result;
      }

      function repeat(name, count){
          var result = [];
          while(count > 0){
            result.push(name);
            count--;
          }
          return result;
      }
        var dataNeg = [];
        data.forEach(function(row){
            if(row['gram'] === "negative"){
                dataNeg.push([row['penicilin'], row['streptomycin'], row['neomycin']]);
            }
        })
        var dataPos = [];
        data.forEach(function(row){
            if(row['gram'] === "positive"){
                dataPos.push([row['penicilin'], row['streptomycin'], row['neomycin']]);
            }
        })
        // 9 gram- -> 27 entries 
        // 7 gram+ -> 21 entries
        var xlabels = repeat('Negative', 9).concat(repeat('Positive', 7));
        var penicilinNeg = dataNeg.map(function(row){
            return row[0];
        })
        var streptomycinNeg = dataNeg.map(function(row){
            return row[1];
        })

        var neomycinNeg = dataNeg.map(function(row){
            return row[2];
        })

        var penicilinPos = dataPos.map(function(row){
            return row[0];
        })
        var streptomycinPos = dataPos.map(function(row){
            return row[1];
        })

        var neomycinPos = dataPos.map(function(row){
            return row[2];
        })

        var tracePenicilin = {
            y:penicilinNeg.concat(penicilinPos), 
            x:xlabels, 
            name:"Penicilin", 
            marker:{color:'rgb(0,0,205)'}, 
            type:'box'
        };

        var traceStreptomycin = {
            y:streptomycinNeg.concat(streptomycinPos), 
            x:xlabels, 
            name:"Streptomycin", 
            marker:{color:'rgb(34,139,34)'}, 
            type:'box'
        };
        var traceNeomycin = {
            y:neomycinNeg.concat(neomycinPos), 
            x:xlabels, 
            name:"Neomycin", 
            marker:{color:'#FF4136'}, 
            type:'box', 
            boxpoints:'false'
        };

        var dataBox = [tracePenicilin, traceStreptomycin, traceNeomycin];
        var layoutBox = {
            yaxis:{
                title:'MIC', 
                scale:'log'
            }, 
            height:700,
            width:1000,
            boxmode:'group'
        };

        Plotly.newPlot('viz-1', dataBubble, layoutBubble, {staticPlot:true});
        Plotly.newPlot('viz-2', dataBar, layoutBar, {staticPlot:true});
        Plotly.newPlot('viz-3', dataBox, layoutBox, {staticPlot:true})  
    })
     
});