var siteGeoPoints = {};
var taxaVectorLayer = null;
var mapTaxaSite;
renderTaxaSiteMap();

// Show loading screen
var detailedTaxaDashboard = $("#detailed-taxa-dashboard");
var taxaDashboardWrapper = detailedTaxaDashboard.find(".dashboard-wrapper");
var loadingScreen = _.template($('#dashboard-loading-screen').html());
taxaDashboardWrapper.prepend(loadingScreen);

var parameters = '';
var urlTemplate = _.template("?taxon=<%= taxon %>&search=<%= search %>&siteId=<%= siteId %>" +
            "&collector=<%= collector %>&category=<%= category %>" +
            "&yearFrom=<%= yearFrom %>&yearTo=<%= yearTo %>&months=<%= months %>&boundary=<%= boundary %>&userBoundary=<%= userBoundary %>" +
            "&referenceCategory=<%= referenceCategory %>&reference=<%= reference %>");

if (typeof filterParameters !== 'undefined') {
    parameters = filterParameters;
    parameters['taxon'] = taxaId;
}

var $originInfoList = $('.origin-info-list');
$.each($originInfoList.children(), function (key, data) {
    var $originInfoItem = $(data);
    $originInfoItem.css('background-color', '');
});

var $endemicInfoList = $('.endemic-info-list');
$.each($endemicInfoList.children(), function (key, data) {
    var $endemicInfoItem = $(data);
    $endemicInfoItem.css('background-color', '');
});

var $conservationStatusList = $('.conservation-status-list');
$.each($conservationStatusList.children(), function (key, data) {
    var $conservationStatusItem = $(data);
    $conservationStatusItem.css('background-color', '');
});

$.ajax({
    url: '/api/get-bio-records/' + urlTemplate(parameters),
    dataType: 'json',
    success: function (data) {
        detailedTaxaDashboard.find('.loading-dashboard').remove();

        if (data.length === 0) {
            return false;
        }

        detailedTaxaDashboard.find('.detailed-dashboard-title').html(data[0]['original_species_name']);

        // Set origin
        var category = data[0]['category'];
        $.each($originInfoList.children(), function (key, data) {
            var $originInfoItem = $(data);
            if ($originInfoItem.data('value') === category) {
                $originInfoItem.css('background-color', 'rgba(5, 255, 103, 0.28)');
            }
        });

        // Set endemic
        var endemic = data[0]['endemism'];
        $.each($endemicInfoList.children(), function (key, data) {
            var $endemicInfoItem = $(data);
            if ($endemicInfoItem.data('value') === endemic.toLowerCase()) {
                $endemicInfoItem.css('background-color', 'rgba(5, 255, 103, 0.28)');
            }
        });

        // Set con status
        var conservation = data[0]['taxonomy']['iucn_status_name'];
        $.each($conservationStatusList.children(), function (key, data) {
            var $conservationStatusItem = $(data);
            if ($conservationStatusItem.data('value') === conservation) {
                $conservationStatusItem.css('background-color', 'rgba(5, 255, 103, 0.28)');
            }
        });

        var $overviewWrapper = $('#overview-taxa-table');
        var overViewTable = _.template($('#taxon-overview-table').html());
        $overviewWrapper.html(overViewTable({
            id: urlTemplate(parameters),
            count: data.length,
            taxon_class: data[0]['taxonomy']['taxon_class'],
            gbif_id: data[0]['taxon_gbif_id']
        }));
        var $wrapper = $('#overview-name-taxonomy-table');
        var detailsTable = _.template($('#taxon-detail-table').html());
        $wrapper.html(detailsTable(data[0]['taxonomy']));

        $('#taxa-records-timeline-graph').parent().empty().append('<canvas id="taxa-records-timeline-graph" width="150px" height="150px"></canvas>');
        siteGeoPoints = {};
        countObjectPerDateCollection(data);
        countObjectPerSite(data);

        var recordsOptions = {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Records'
            },
                legend: {
                display: false
            },
            scales: {
            xAxes: [{
                barPercentage: 0.4,
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 90
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Year'
                }
            }],
            yAxes: [{
                 stacked: true,
                 scaleLabel: {
                    display: true,
                    labelString: 'Occurrence'
             }
            }]
            }
        };

        var objectDatasets= [{
            data: Object.values(dataByYear),
            backgroundColor: 'rgba(222, 210, 65, 1)'
        }];
        createTimelineGraph(document.getElementById("taxa-records-timeline-graph").getContext('2d'), yearArray, objectDatasets, recordsOptions)
        
        var $table = $('<table></table>');
        for(var key in dataByYear){
            $table.append('<tr><td>' + key + '</td><td>' + dataByYear[key] + '</td></tr>')
        }
        $('#records-table').html($table);

        var $tableArea = $('<table></table>');
        $tableArea.append('<tr><th>ID</th><th>Site name</th><th>Records</th></tr>')
        for(var site in dataBySite){
            if(dataBySite[site]['site_name'] !== undefined) {
                $tableArea.append('<tr><td>' + site + '</td><td data-site-id="' + site + '">' + dataBySite[site]['site_name'] + '</td><td>' + dataBySite[site]['count'] + '</td></tr>')
            }else {
                $tableArea.append('<tr><td>' + site + '</td><td data-site-id="'+site+'">' + site + '</td><td>' + dataBySite[site]['count'] + '</td></tr>')
            }
        }
        $('#records-area-table').html($tableArea);
        
        $.each(data, function (index, value) {
            var sites = Object.keys(siteGeoPoints);
            if(!sites.includes(value['site'])) {
                var center = JSON.parse(value['location']);
                siteGeoPoints[value['site']] = center['coordinates'];
                addFeatures(siteGeoPoints);
            }
        });
    }
});

function renderTaxaSiteMap() {
    $('#taxasite-map').empty();
    mapTaxaSite = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        target: 'taxasite-map',
        view: new ol.View({
          center: [0, 0],
          zoom: 12
        })
    });

    document.getElementById('export-taxasite-map').addEventListener('click', function() {
        mapTaxaSite.once('postcompose', function(event) {
          var canvas = event.context.canvas;
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
          } else {
            canvas.toBlob(function(blob) {
              saveAs(blob, 'map.png');
            });
          }
        });
        mapTaxaSite.renderSync();
    });
}

function addFeatures(data) {
    if(taxaVectorLayer !== null){
        mapTaxaSite.removeLayer(taxaVectorLayer);
        taxaVectorLayer = null;
    }

    var iconFeatures=[];

    $.each(data, function (index, value) {
        var center = ol.proj.transform([value[0], value[1]], 'EPSG:4326', 'EPSG:3857');
        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(center)
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: '/static/img/map-marker.png'
            }))
        });
        iconFeature.setStyle(iconStyle);
        iconFeatures.push(iconFeature);
    });

    var vectorSource = new ol.source.Vector({
      features: iconFeatures
    });

    taxaVectorLayer = new ol.layer.Vector({
      source: vectorSource
    });
    mapTaxaSite.addLayer(taxaVectorLayer);
    mapTaxaSite.getView().fit(taxaVectorLayer.getSource().getExtent(), mapTaxaSite.getSize());
}

var yearArray = [];
var dataByYear = {};
function countObjectPerDateCollection(data) {
    yearArray = [];
    dataByYear = {};
    $.each(data, function (key, value) {
        var collection_year = new Date(value['collection_date']).getFullYear();
        if($.inArray(collection_year, yearArray) === -1){
            yearArray.push(collection_year)
        }
    });
    yearArray.sort();

    $.each(yearArray, function (idx, year) {
        dataByYear[year] = 0;
        $.each(data, function (key, value) {
           var valueYear = new Date(value['collection_date']).getFullYear();
            if(valueYear === year){
                dataByYear[year] += 1;
            }
        })
    })
}

var dataBySite = {};
function countObjectPerSite(data) {
    dataBySite = {};
    $.each(data, function (key, value) {
        if (!dataBySite.hasOwnProperty(value['site'])) {
            dataBySite[value['site']] = {
                'count': 1,
                'site_name': value['site_name']
            }
        } else {
            dataBySite[value['site']]['count'] += 1;
        }
    });
}

function createTimelineGraph(canvas, labels, dataset, options) {
    var myChart;
    myChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: dataset
        },
        options: options
    });
}
