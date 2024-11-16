import React, { useState } from "react";
import './App.css'; // Importing the CSS file for styling

function SpecsInput() {
  const [rightSph, setRightSph] = useState("");
  const [rightCyl, setRightCyl] = useState("");
  const [rightAxis, setRightAxis] = useState("");
  const [leftSph, setLeftSph] = useState("");
  const [leftCyl, setLeftCyl] = useState("");
  const [leftAxis, setLeftAxis] = useState("");
  const [lensDescription, setLensDescription] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);

  const handleShare = () => {
    const file = new File([imageBlob], "specs-power-image.png", { type: "image/png" });
    const fileUrl = URL.createObjectURL(file);

    if (navigator.share) {
      navigator.share({
        files: [file],
        url: fileUrl,
        title: "Specs Power Image",
        text: "Check out my specs power details",
      })
      .then(() => {
        console.log("Image shared successfully");
      })
      .catch((error) => {
        console.error("Error sharing image", error);
      });
    } else {
      alert("Share functionality is not supported in your browser. Please download the image and share manually.");
    }
  };

  function formatSpecsPower(input) {
    if (input === "") {
      return input
    }
    let num = parseFloat(input); // Convert the input to a number
  
    // Format the number with 2 decimal places
    let formatted = num.toFixed(2);
  
    // If the number is positive or zero, add the '+' sign
    if (num > 0) {
      formatted = '+' + formatted;
    }
  
    return formatted;
  }  

  const generateImage = (data) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#000000";
    context.font = "20px Arial";

    // Table Header
    context.fillText("Specs Power", 50, 50);
    context.fillText("Spherical", 200, 100);
    context.fillText("Cylindrical", 400, 100);
    context.fillText("Axis", 600, 100);

    // Helper to draw cells with optional red background
    const drawCell = (text, x, y, isError = false) => {
      if (isError) {
        context.fillStyle = "#FFCCCC"; // Red background for error
        context.fillRect(x - 10, y - 20, 120, 30);
        context.fillStyle = "#000000"; // Reset to black for text
      }
      context.fillText(text || "-", x, y);
    };

    console.log("tor - ", typeof(data.rightCylindrical))

    // Right Eye Row
    context.fillText("Right", 50, 150);
    drawCell(formatSpecsPower(data.rightSpherical), 200, 150);
    drawCell(formatSpecsPower(data.rightCylindrical), 400, 150);
    drawCell(data.rightAxis, 600, 150, data.rightCylindrical && !data.rightAxis);

    // Left Eye Row
    context.fillText("Left", 50, 200);
    drawCell(formatSpecsPower(data.leftSpherical), 200, 200);
    drawCell(formatSpecsPower(data.leftCylindrical), 400, 200);
    drawCell(data.leftAxis, 600, 200, data.leftCylindrical && !data.leftAxis);

    // Additional Fields
    context.fillText(`Lens Description: ${data.lensDescription}`, 50, 300);
    context.fillText(`Supplier Name: ${data.supplierName}`, 50, 350);
    context.fillText(`Urgent: ${data.urgent ? "Yes" : "No"}`, 50, 400);

    // Convert canvas to Blob (image)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setImageUrl(url); // Set image URL for display
      setImageBlob(blob); // Store Blob for sharing
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for at least one field in right or left eye
    if (
      (!rightSph && !rightCyl && !rightAxis) &&
      (!leftSph && !leftCyl && !leftAxis)
    ) {
      alert("Please fill in at least one field for right or left eye.");
      return;
    }

    generateImage({
      rightSpherical: rightSph,
      rightCylindrical: rightCyl,
      rightAxis: rightAxis,
      leftSpherical: leftSph,
      leftCylindrical: leftCyl,
      leftAxis: leftAxis,
      lensDescription: lensDescription,
      supplierName: supplierName,
      urgent: urgent,
    });
  };

  return (
    <div className="container">
      <h1>Specs Power Input</h1>
      <form onSubmit={handleSubmit}>
        {/* Power Table */}
        <div className="power-table">
          <div className="row">
            <span>Right</span>
            <input
              type="number"
              value={rightSph}
              onChange={(e) => setRightSph(e.target.value)}
              placeholder="Spherical Power"
            />
            <input
              type="number"
              value={rightCyl}
              onChange={(e) => setRightCyl(e.target.value)}
              placeholder="Cylindrical Power"
            />
            <input
              type="number"
              value={rightAxis}
              onChange={(e) => setRightAxis(e.target.value)}
              placeholder="Axis"
            />
          </div>
          <div className="row">
            <span>Left</span>
            <input
              type="number"
              value={leftSph}
              onChange={(e) => setLeftSph(e.target.value)}
              placeholder="Spherical Power"
            />
            <input
              type="number"
              value={leftCyl}
              onChange={(e) => setLeftCyl(e.target.value)}
              placeholder="Cylindrical Power"
            />
            <input
              type="number"
              value={leftAxis}
              onChange={(e) => setLeftAxis(e.target.value)}
              placeholder="Axis"
            />
          </div>
        </div>

        {/* Lens Description */}
        <div className="input-group">
          <label>
            Lens Description:
            <textarea
              value={lensDescription}
              onChange={(e) => setLensDescription(e.target.value)}
              placeholder="Enter lens description"
            />
          </label>
        </div>

        {/* Supplier Name */}
        <div className="input-group">
          <label>
            Supplier Name:
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
            />
          </label>
        </div>

        {/* Urgent Checkbox */}
        <div className="input-group">
          <label>
            Urgent:
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit">Generate Image</button>
      </form>

      {/* Share Button */}
      {imageUrl && (
        <div className="share-section">
          {/* <button onClick={handleShare}>Share on WhatsApp</button> */}
          <img src={imageUrl} alt="Generated Specs Image" className="image-preview" />
        </div>
      )}
    </div>
  );
}

export default SpecsInput;
