$(document).ready(function() {
    var csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSa0aOzsbBYTUp_y7j83cMV1LEtz_rH6vovCkW1rvSBC6CEfJxqFKxZ0EPAdpQvCeCVDIMWI8M8VI9E/pub?gid=0&single=true&output=csv"; // Replace with your published Google Spreadsheet CSV URL

    // Fetch the CSV data using AJAX and PapaParse for conversion
    $.ajax({
        url: csvUrl,
        success: function(csvData) {
            // Convert CSV to JSON
            Papa.parse(csvData, {
                header: true, // Assumes first row of CSV are headers
                dynamicTyping: true, // Automatically convert numbers and booleans
                skipEmptyLines: true,
                complete: function(results) {
                    var table = $('#example').DataTable({
                        "data": results.data,
                        "columns": [
                            { "data": "date" }, // Adjust based on your CSV headers
                            { "data": "group" },
                            { "data": "province" },
                            { "data": "fatalities" }
                        ],
                        "dom": 'Bfrtip',
                        "buttons": [
                            'copy', 'csv', 'excel', 'pdf', 'print'
                        ]
                    });

                    // Setup the date range picker with an empty field on first load
                    $('#dateRange').daterangepicker({
                        locale: {
                            format: 'YYYY-MM-DD'
                        },
                        opens: 'left',
                        autoUpdateInput: false,
                    }).on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
                        $.fn.dataTable.ext.search.pop();
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
                        $.fn.dataTable.ext.search.pop();
                        table.draw();
                    });
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching or parsing data: ' + textStatus, errorThrown);
        },
        dataType: "text" // Important for interpreting the fetched data as CSV
    });
});
