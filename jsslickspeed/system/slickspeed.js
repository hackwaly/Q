//base test functions
    
function insertJSSlickspeedFrameworkIframes(){    
    var iframepos = document.getElementById("addIframe");
    if(document.querySelectorAll){
      frameworks["Browser Native"]= {
          file:-1        
      }
    }
    for (var framework in frameworks){
         var data=frameworks[framework];
         var iframecontainer = document.createElement("div");
		 iframecontainer.style.display="inline";
		 var iframestr='<iframe name="'+framework+'" src="template.html?include='+data.file+'&function='+data["function"]+"&nocache="+new Date().getTime()+'"></iframe>';
         iframecontainer.innerHTML=iframestr;
         iframepos.parentNode.insertBefore(iframecontainer,iframepos);
    }
}
  
function createJSSlickspeedFooter() {
     var container=document.getElementById("tfooter");
     for (var framework in frameworks){
          var td = document.createElement("td");
          td.className="score";
          td.innerHTML=0;
          container.appendChild(td)
    }
} 

function createJSSlickspeedHeader() {
     var container=document.getElementById("selectors");
     for (var framework in frameworks){
          var th = document.createElement("th");
          th.className="framework";
          th.innerHTML=framework;
          container.appendChild(th)
    }
} 

function createJSSlickspeedRows() {
  
     var container=document.getElementById("tbody");
     
     for (var i=0,ln=selectors.length;i<ln;i++){
		  var tr = document.createElement("tr");
		  var th = document.createElement("th");
		  th.className="selector";
		  th.innerHTML=selectors[i];
		  tr.appendChild(th);
		  for (var framework in frameworks){
		        var td = document.createElement("td");
				td.className="empty";
				tr.appendChild(td);
		  }		  
		  container.appendChild(tr);
     }

} 
function forEach(iterable, fn, bind){
	for (var i = 0, j = iterable.length; i < j; i++) fn.call(bind, iterable[i], i, iterable);
};

//test start
run();



function run() {

	insertJSSlickspeedFrameworkIframes();
	createJSSlickspeedHeader();
    createJSSlickspeedRows();
    createJSSlickspeedFooter();
	
	var frameworkToLoad = frameworkLoaded= document.getElementsByTagName('iframe').length;
	
	var loaded=0,failed={},flagged={};
	
	var controls = document.getElementById('controls');
	var links    = controls.getElementsByTagName("a");
	links[1].innerHTML="loading...";
	links[0].style.display="none";
	
	var pool=setInterval(function(){
	  
	    forEach(document.getElementsByTagName('iframe'), function(iframe){
	         var iframedoc = window.frames[iframe.name];
			 if(!iframedoc){
	           frameworkLoaded--;
               failed[iframe.name]=flagged[iframe.name]=true;			    
			 }
	         if(flagged[iframe.name])
	            return;

	         if(iframedoc.isFrameworkLoaded==true){
	           loaded++;
	           flagged[iframe.name]=true;
	         }
	         if(iframedoc.isFrameworkLoaded==-1){
	           frameworkLoaded--;
               failed[iframe.name]=flagged[iframe.name]=true;	                         
	         } 
	    })

      if(loaded==frameworkLoaded){
           clearInterval(pool);
           if(loaded<frameworkToLoad){
               var fails = [];
               for(var fail in failed) fails.push(fail);
               alert("The following framework failed to load:"+fails.join(','));
           }
           createTestRunnerHanlders(); 
      }  
	},1000);
	
	function createTestRunnerHanlders() {

	    var fws = {};
        forEach(document.getElementsByTagName('iframe'), function(iframe){

            fws[iframe.name] = {
              'test': failed[iframe.name]? function(){return {error:"not loaded",time:0}} :window.frames[iframe.name].test,
              'selectors': []
            };
        })
	  
	    var tbody = document.getElementById('tbody');
	    var tfoot = document.getElementById('tfoot');
      	var lastrow = tfoot.getElementsByTagName('tr')[0];
      	
      	var controls = document.getElementById('controls');
      	
      	var links = controls.getElementsByTagName('a');
      	
      	var start = links[1];
      	start.innerHTML="start tests";
      	var stop = links[0];
      	stop.style.display="block";
      	
      	start.onclick = function(){
      		testRunner();
      		return false;
      	};
      	
      	stop.onclick = function(){
      		clearTimeout(timer);
      		timer = null;
      		return false;
      	};
      	
      	var score = [];
      	var scores = {};
      	
      	var frxi = 0;
      	for (var name in fws){
      		var framework = fws[name];
      		forEach(window.selectors, function(selector){
      			framework.selectors.push(selector);
      		});
      		scores[name] = lastrow.getElementsByTagName('td')[frxi];
      		score[name] = 0;
      		frxi++;
      	}
      	
      	var tests = [];
      
      	forEach(window.selectors, function(selector, i){
      		var frxi = 0;
      		var row = tbody.getElementsByTagName('tr')[i];
      		for (var name in fws){
      			var framework = fws[name];
      			var cell = row.getElementsByTagName('td')[frxi];
      			tests.push({
      				'execute': framework.test,
      				'selector': framework.selectors[i],
      				'name': name,
      				'row': row,
      				'cell' : cell
      			});
      			frxi++;
      		}
      	});

        var timer = null;

        var testRunner = function(){
            var test = tests.shift();
            if (!test) return;
            var results = test.execute(test.selector);
            function handleResults(){
                var ops = results && results.ops || 0;
                test.cell.className = 'test';
                test.cell.innerHTML = '<b>'+Math.round(ops * 10)/10 + ' ops/s</b> | <b>' + results.found + ' found</b>';
                test.cell.speed = results.ops || 0;
                if (results.error){
                    test.cell.innerHTML = '<b>'+ ops + ' ops/s</b> | <span class="exception" title="' + results.error + '">error returned</a>';
                    test.cell.className += ' exception';
                    test.cell.found = 0;
                    test.cell.error = true;
                } else {
                    test.cell.found = results.found;
                    test.cell.error = false;
                }

                score[test.name] += test.cell.speed;
                scores[test.name].innerHTML =  '&nbsp;' + Math.round(score[test.name]) + '&nbsp;';

                if (test.cell == test.row.lastChild) colourRow(test.row);
            };
            // setTimeout(handleResults,100);
            handleResults();
            timer = setTimeout(testRunner,0);
        };

        var colourRow = function(row){

            var cells = [];

            var tds = row.getElementsByTagName('td');
            forEach(tds, function(td){
                cells.push(td);
            });

            var speeds = [], sum = 0, length = 0;

            forEach(cells, function(cell, i){
                if (!cell.error) {
                    sum += cell.speed;
                    length++;
                    speeds[i] = cell.speed;
                }
                //error, so we exclude it from colouring
                else speeds[i] = 99999999999999999999999;

            });

            var avg = sum / length;

            var min = Math.min.apply(this, speeds);
            var max = Math.max.apply(this, speeds);

            avg = speeds[0];

            var found = [];
            var mismatch = false;
            forEach(cells, function(cell, i){
                found.push(cell.found);
                if (!mismatch){
                    forEach(found, function(n){
                        if (cell.found && n && cell.found != n){
                            mismatch = true;
                            return;
                        }
                    });
                }
                cell.title = cell.firstChild.innerHTML;
                cell.firstChild.innerHTML = (Math.round(cell.speed / avg * 10) / 10) + 'x'
                if (cell.found && cell.speed == max) cell.className += ' good';
                else if (!cell.found) cell.className += ' zero';
                else if (cell.speed == min) cell.className += ' bad';
                else cell.className += ' normal';
            });

            if (mismatch){
                forEach(cells, function(cell, i){
                    if (cell.found) cell.className += ' mismatch';
                });
            }

        };
    }
}
