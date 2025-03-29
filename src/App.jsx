import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { TextArea } from "@progress/kendo-react-inputs";
import { Loader } from "@progress/kendo-react-indicators";

const PoeticEcho = () => {
  const poeticStyles = [
    { id: "haiku", name: "Haiku" },
    { id: "sonnet", name: "Sonnet" },
    { id: "freeverse", name: "Free Verse" },
  ];

  const [inputText, setInputText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(poeticStyles[0]);
  const [generatedPoem, setGeneratedPoem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const worker = useRef(null);

  const handleInputChange = (e) => setInputText(e.target.value);
  const handleStyleChange = (e) => setSelectedStyle(e.target.value);

  const handleWorkerMessage = useCallback((e) => {
    setIsLoading(false);
    if (e.data.error) {
      setError(e.data.error);
    } else {
      setGeneratedPoem(e.data.poem || "No poem generated.");
    }
  }, []);

  useEffect(() => {
    worker.current = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    worker.current.addEventListener("message", handleWorkerMessage);
    worker.current.postMessage({ initialize: true });

    return () => {
      worker.current.removeEventListener("message", handleWorkerMessage);
      worker.current.terminate();
    };
  }, [handleWorkerMessage]);

  const transformText = () => {
    if (!inputText.trim()) {
      setError("Please enter text to transform");
      return;
    }
    setError(null);
    setIsLoading(true);

    worker.current.postMessage({ inputText, style: selectedStyle.id });
  };

  return (
    <div>
      <h1>Poetic Echo</h1>
      <TextArea
        label="Enter Text"
        value={inputText}
        onChange={handleInputChange}
      />
      <DropDownList
        data={poeticStyles}
        textField="name"
        valueField="id"
        value={selectedStyle}
        onChange={handleStyleChange}
      />
      <Button onClick={transformText} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Poem"}
      </Button>
      {isLoading && <Loader type="converging-spinner" />}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {generatedPoem && (
        <div>
          <h3>Generated Poem:</h3>
          <p>{generatedPoem}</p>
        </div>
      )}
    </div>
  );
};

export default PoeticEcho;
