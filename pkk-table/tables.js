$(document).ready(function() {
    var csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSa0aOzsbBYTUp_y7j83cMV1LEtz_rH6vovCkW1rvSBC6CEfJxqFKxZ0EPAdpQvCeCVDIMWI8M8VI9E/pub?gid=0&single=true&output=csv"; // Your CSV URL

    $.ajax({
        url: csvUrl,
        success: function(csvData) {
            Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    var table = $('#example').DataTable({
                        "data": results.data,
                        "columns": [
                            { "data": "date" },
                            { "data": "group" },
                            { "data": "province" },
                            { "data": "fatalities" }
                        ],
                        "dom": 'Bfrtip',
                        "buttons": [
                            'copy', 'csv', 'excel', 'pdf', 'print'
                        ],
                        initComplete: function() {
                            $(".dt-buttons").appendTo(".export-buttons-title");
                        }
                    });

                    $('#dateRange').daterangepicker({
                        locale: {
                            format: 'YYYY-MM-DD'
                        },
                        opens: 'left',
                        autoUpdateInput: false,
                    }).on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
                        $.fn.dataTable.ext.search.push(
                            function(settings, data, dataIndex) {
                                var startDate = picker.startDate.format('YYYY-MM-DD');
                                var endDate = picker.endDate.format('YYYY-MM-DD');
                                var date = data[0]; // Assuming date is in the first column
                                return (date >= startDate && date <= endDate);
                            }
                        );
                        table.draw();
                    }).on('cancel.daterangepicker', function(ev, picker) {
                        $(this).val('');
                        table.draw();
                    });

                    // Year Filter
                    $('#yearFilter').on('change', function() {
                        var selectedYear = $(this).val();
                        $.fn.dataTable.ext.search.push(
                            function(settings, data, dataIndex) {
                                if (selectedYear) {
                                    var year = data[0].split('-')[0]; // Assuming date is in the first column and formatted as YYYY-MM-DD
                                    return year === selectedYear;
                                }
                                return true; // If no year is selected, do not filter
                            }
                        );
                        table.draw();
                        $.fn.dataTable.ext.search.pop(); // Clear the search criteria
                    });
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching or parsing data: ' + textStatus, errorThrown);
        },
        dataType: "text"
    });
});
