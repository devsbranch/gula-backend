$(document).ready(function () {
    $.ajax({
        url: '/api/fish-summary/',
        dataType: 'json',
        success: function (data) {
            $('#chart-fish').parent().empty().append('<canvas id="chart-fish" width="210px" height="210px"></canvas>');
            var native = 0;
            var non_native = 0;
            var translocated = 0;

            if(data.hasOwnProperty('total_fish')){
                $('#fish-total-records').html(data['total_fish']);
            }

            if(data.hasOwnProperty('total_fish_site')) {
                $('#fish-total-sites').html(data['total_fish_site']);
            }

            if(data.hasOwnProperty('category')) {
                if (data['category']['indigenous']) {
                    native += data['category']['indigenous'];
                }
                if (data['category']['alien']) {
                    non_native += data['category']['alien'];
                }
                if (data['category']['translocated']) {
                    translocated += data['category']['translocated'];
                }
            }

            var fishContainer = document.getElementById("chart-fish");
            var fishData = {
                labels: ["Native", "Non-Native", "Translocated"],
                datasets: [{
                    data: [native, non_native, translocated],
                    backgroundColor: [
                        '#a13447',
                        '#00a99d',
                        '#e0d43f'
                    ],
                    borderWidth: 1
                }]
            };
            createDonutGraph(fishContainer, fishData)
        }
    })
});

function createDonutGraph(container, data) {
    var donutChart = new Chart(container, {
        type: 'doughnut',
        data: data,
        options: {
            cutoutPercentage: 70,
            legend: {
                display: false
            }
        }
    });
}