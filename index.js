// Required dependencies
const express = require('express');
const { Pool } = require('pg');
const excelJS = require('exceljs');

// Initialize the Express app
const app = express();
const PORT = 3000;

// PostgreSQL pool configuration
const pool = new Pool({
  user: "postgres",
  host: "158.220.121.203",
  database: "postgres",
  password: "P0stgr3s%098",
  port: 5432,
});

// GET route to fetch data and generate an Excel file
app.get('/getdata', async (req, res) => {
  try {
    // SQL query
    const query = `
      SELECT * 
      FROM campaigns
      WHERE TO_DATE(date_, 'DD-Mon-YY') > TO_DATE('21-Dec-24', 'DD-Mon-YY')
    `;

    // Execute the query
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).send('No data found');
    }

    // Create a new Excel workbook and worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Campaigns Data');

    // Add headers to the worksheet
    worksheet.columns = Object.keys(result.rows[0]).map(key => ({
      header: key,
      key: key,
    }));

    // Add rows to the worksheet
    result.rows.forEach(row => {
      worksheet.addRow(row);
    });

    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=campaigns_data.xlsx');

    // Write the Excel file to the response
    await workbook.xlsx.write(res);

    res.status(200).end();
  } catch (error) {
    console.error('Error fetching data or generating Excel:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
