const express = require('express');
const bodyParser = require('body-parser');
const { jsPDF } = require('jspdf'); // Import jsPDF if needed for server-side PDF generation

const fs = require('fs');
const path = require('path');


const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const cors = require('cors');
app.use(cors());
// Serve static files from the "public" folder
app.use(express.static('public'));



app.post('/generate-pdf', (req, res) => {
    const { name, jobTitle, description } = req.body;

    if (!name || !jobTitle || !description) {
        return res.status(400).send('Missing required fields.');
    }

    try {
        // Generate the PDF using jsPDF
        const pdf = new jsPDF();
        pdf.text(20, 20, `Name: ${name}`);
        pdf.text(20, 30, `Job Title: ${jobTitle}`);
        pdf.text(20, 40, `Description: ${description}`);

        // Save the PDF locally
        const filePath = path.join(__dirname, 'resume.pdf');
        pdf.save(filePath, (err) => {
            if (err) {
                console.error('Error saving PDF:', err);
                return res.status(500).send('Failed to generate PDF.');
            }

            // Add correct headers for download
            res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
            res.setHeader('Content-Type', 'application/pdf');

            // Send file to client
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Failed to send file.');
                }
                // Optionally delete the file after sending
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF.');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
