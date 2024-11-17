import React, { useState } from "react";
import './App.css'; // Importing the CSS file for styling

function SpecsInput() {
  const [customerName, setCustomerName] = useState("");
  const [rightAddition, setRightAddition] = useState("");
  const [leftAddition, setLeftAddition] = useState("");
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

    if (navigator.share) {
      navigator.share({
        files: [file],
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

  const divideDescription = (description, maxLineLength) => {
    let descriptionWords = description.split(" ")
    let lines = []
    let currentLine = ""
    descriptionWords.forEach(word => {
      if (currentLine.length + word.length > maxLineLength) {
        lines.push(currentLine)
        currentLine = ""
      }
      currentLine = currentLine + " " + word
    })
    lines.push(currentLine)
    return lines
  }
  
  const generateImage = (data) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    canvas.width = 800;
    canvas.height = 800;
    
    context.fillStyle = data.urgent ? "#FFCCCC" : "#FFFFFF"; // Red for urgent, white otherwise
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "#000000";
    
    let yPosition = 80; // Adjust based on content
    let lineHeight = 30;
    let sectionSepartorLineHeightMultiplier = 2.5
    let powerTableLineHeightMultiplier = 2
    
    
    if (data.urgent) {
      context.font = "60px Arial";
      context.fillText("Urgent!!!", 300, yPosition);
      yPosition = yPosition + sectionSepartorLineHeightMultiplier * lineHeight;
    }
    
    context.font = "30px Arial";
    
    // Table Header
    context.fillText("Specs Power", 50, yPosition);
    yPosition = yPosition + sectionSepartorLineHeightMultiplier * lineHeight;

    // Column Headers
    context.fillText("Spherical", 200, yPosition);
    context.fillText("Cylindrical", 400, yPosition);
    context.fillText("Axis", 600, yPosition);
    yPosition = yPosition + sectionSepartorLineHeightMultiplier * lineHeight;


    // Helper to draw cells with optional red background
    const drawCell = (text, x, y, isError = false) => {
      context.strokeStyle = "#000000"; // Black border
      if (isError) {
        context.fillStyle = "#FFCCCC"; // Red background for error
        context.fillRect(x - 10, y - 20, 120, 30);
        context.fillStyle = "#000000"; // Reset to black for text
      }
      context.fillText(text || "-", x, y);
    };

    // Right Eye Row
    context.fillText("Right", 50, yPosition);
    drawCell(formatSpecsPower(data.rightSpherical), 200, yPosition);
    drawCell(formatSpecsPower(data.rightCylindrical), 400, yPosition);
    drawCell(data.rightAxis, 600, yPosition, data.rightCylindrical && !data.rightAxis);
    yPosition = yPosition + powerTableLineHeightMultiplier * lineHeight;

    // Left Eye Row
    context.fillText("Left", 50, yPosition);
    drawCell(formatSpecsPower(data.leftSpherical), 200, yPosition);
    drawCell(formatSpecsPower(data.leftCylindrical), 400, yPosition);
    drawCell(data.leftAxis, 600, yPosition, data.leftCylindrical && !data.leftAxis);
    yPosition = yPosition + powerTableLineHeightMultiplier * lineHeight;

    if (data.rightAddition || data.leftAddition) {
      context.fillText("Addition", 50, yPosition);
      if (data.rightAddition !== data.leftAddition) {
        context.fillText(formatSpecsPower(data.rightAddition) + " (R)" || "-", 200, yPosition);
        context.fillText(formatSpecsPower(data.leftAddition) + " (L)" || "-", 400, yPosition);
      } else {
        context.fillText(formatSpecsPower(data.rightAddition) + " (Both Eyes)" || "-", 300, yPosition);
      }
      yPosition = yPosition + sectionSepartorLineHeightMultiplier * lineHeight;
    }
    
    yPosition = yPosition + lineHeight/1.5
    lineHeight = lineHeight * 1.5

    const drawLine = (yPosition) => {
      // Define a new path
      context.beginPath();

      // Set a start-point
      context.moveTo(0, yPosition);

      // Set an end-point
      context.lineTo(800, yPosition);

      // Stroke it (Do the Drawing)
      context.stroke();
    }



    // Additional Fields
    if (data.lensDescription) {
      drawLine(yPosition - lineHeight/1.2);
      let dividedDesc = divideDescription(data.lensDescription, 50)
      context.font = "bold 27px Arial";
      dividedDesc.forEach(descChunk => {
        context.fillText(`${descChunk}`, 50, yPosition);
        yPosition = yPosition + lineHeight;
      })
      drawLine(yPosition - lineHeight/1.5);
      yPosition = yPosition + lineHeight/1.5
    }
    context.font = "27px Arial";
    if (data.customerName) {
      context.fillText(`Customer Name: ${data.customerName}`, 50, yPosition);
    }
    yPosition = yPosition + lineHeight;
    if (data.supplierName) {
      context.fillText(`Supplier Name: ${data.supplierName}`, 50, yPosition);
      yPosition = yPosition + lineHeight;
    }

    // Convert canvas to Blob (image)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setImageUrl(url); // Set image URL for display
      setImageBlob(blob); // Store Blob for sharing
    });

    
    setTimeout(window.scrollTo(0, document.body.scrollHeight), 100);
  };

  const handleCopyAddition = () => {
    if (leftAddition === "" && rightAddition !== "") {
      setLeftAddition(rightAddition);
    } else if (rightAddition === "" && leftAddition !== "") {
      setRightAddition(leftAddition);
    } else {
      setLeftAddition(rightAddition);
    }
  }

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
      customerName,
      rightSpherical: rightSph,
      rightCylindrical: rightCyl,
      rightAxis: rightAxis,
      leftSpherical: leftSph,
      leftCylindrical: leftCyl,
      leftAxis: leftAxis,
      lensDescription: lensDescription,
      supplierName: supplierName,
      urgent: urgent,
      rightAddition: rightAddition,
      leftAddition: leftAddition,
    });
  };

  const handleReset = () => {
    setRightSph("");
    setRightCyl("");
    setRightAxis("");
    setLeftSph("");
    setLeftCyl("");
    setLeftAxis("");
    setLensDescription("");
    setSupplierName("");
    setUrgent(false);
    setImageUrl(null);
    setImageBlob(null);
  };

  const rightClick = (e) => {
    const rightClickEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2 // Right-click button
    });
    
    // Dispatch the event on the target element
    e.target.dispatchEvent(rightClickEvent);
  }

  return (
    <div className="container">
      <h1>Specs Power Input</h1>
      <form onSubmit={handleSubmit}>
        {/* Power Table */}
        <div className="power-table">
          <div className="row">
            <span className="power-input-lr-span">R</span>
            <input
              type="number"
              value={rightSph}
              onChange={(e) => setRightSph(e.target.value)}
              placeholder="Sph"
            />
            <input
              type="number"
              value={rightCyl}
              onChange={(e) => setRightCyl(e.target.value)}
              placeholder="Cyl"
            />
            <input
              type="number"
              value={rightAxis}
              onChange={(e) => setRightAxis(e.target.value)}
              placeholder="Axis"
            />
          </div>
          <div className="row">
            <span className="power-input-lr-span">L</span>
            <input
              type="number"
              value={leftSph}
              onChange={(e) => setLeftSph(e.target.value)}
              placeholder="Sph"
            />
            <input
              type="number"
              value={leftCyl}
              onChange={(e) => setLeftCyl(e.target.value)}
              placeholder="Cyl"
            />
            <input
              type="number"
              value={leftAxis}
              onChange={(e) => setLeftAxis(e.target.value)}
              placeholder="Axis"
            />
          </div>
        </div>

        {/* Addition Table */}
        <div className="row">
          <span className="power-input-lr-span">Addition</span>
          <input
            type="number"
            value={rightAddition}
            onChange={(e) => setRightAddition(e.target.value)}
            placeholder="Right Add."
          />
          <input
            type="number"
            value={leftAddition}
            onChange={(e) => setLeftAddition(e.target.value)}
            placeholder="Left Add."
          />
        </div>

        <div id='copy-btn-container'>
          <button id='copy-addition-btn' type="button" onClick={handleCopyAddition}>Copy Addition</button>
        </div>

        <hr></hr>

        {/* Lens Description */}
        <div id="lens-desc-container" className="input-group">
          <label>
            Lens Description:
            <textarea
              value={lensDescription}
              onChange={(e) => setLensDescription(e.target.value)}
              placeholder="Enter lens description"
              maxLength={142}
            />
          </label>
        </div>

      {/* Supplier Name */}
      <div className="input-group">
        <label>
          Customer Name:
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
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
        <div className="input-group-special">
          <label className="custom-checkbox">
            Urgent:
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            <span className="checkmark"></span>
          </label>
        </div>


        {/* Submit Button */}
        <button type="submit">Generate Image</button>
        <button type="button" onClick={handleReset}>Reset</button>
      </form>

      {/* Share Button */}
      {imageUrl && (
        <div className="share-section">
          {/* <button onClick={handleShare}>Share on WhatsApp</button> */}
          <img id="img" src={imageUrl} alt="Generated Specs Image" className="image-preview" onClick={rightClick} />
        </div>
      )}
    </div>
  );
}

export default SpecsInput;
