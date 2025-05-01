import React, { useContext, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaCode, FaCompass, FaLightbulb, FaMicrophone, FaUserCircle } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { MdAddPhotoAlternate } from "react-icons/md";
import geminiLogo from "../assets/geminiLogo.png";
import { Context } from "../context/Context";

// Voice Recognition using SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const MainContent = () => {
  const {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
    showResult,
    loading,
    resultData,
    onSent,
  } = useContext(Context);

  const [cards, setCards] = useState([
    { id: "1", text: "Suggest top 10 web series.", icon: <FaCompass /> },
    { id: "2", text: "What is a loop in JavaScript?", icon: <FaLightbulb /> },
    { id: "3", text: 'Who is known as the "Mother of Dragons"?', icon: <FaMessage /> },
    { id: "4", text: "Who sits on the Iron Throne at the end of the series?", icon: <FaCode /> },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [image, setImage] = useState(null); // State for storing the uploaded image
  const [imageUrl, setImageUrl] = useState(""); // State for the image URL preview
  const [imageAnalysis, setImageAnalysis] = useState(null); // State for storing image analysis result

  // Start voice recognition
  const startListening = () => {
    recognition.start();
    setIsListening(true);
  };

  // Handle voice recognition result
  recognition.onresult = (event) => {
    const voiceInput = event.results[0][0].transcript;
    setInput(voiceInput);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result); // Set the base64 encoded image for preview
        setImage(file); // Store the file in state
        analyzeImage(file); // Call function to analyze the image
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };

  // Analyze image using an API or custom backend (mocked for now)
  const analyzeImage = async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImageAnalysis(data); // Assuming the response contains analyzed data
    } catch (error) {
      console.error("Error analyzing the image:", error);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return; // Dropped outside the valid area
    }

    const reorderedCards = Array.from(cards);
    const [movedCard] = reorderedCards.splice(source.index, 1);
    reorderedCards.splice(destination.index, 0, movedCard);

    setCards(reorderedCards);
  };

  return (
    <div className="flex-1 min-h-screen pb-[15vh] relative">
      <div className="flex items-center justify-between text-xl p-5 text-slate-700">
        <p>Gemini</p>
        <FaUserCircle />
      </div>

      <div className="max-w-[900px] mx-auto">
        {!showResult ? (
          <>
            <div className="my-12 text-[56px] text-slate-500 font-semibold p-5">
              <p>
                <span className="bg-gradient-to-r from-[#368ddd] to-[#ff5546] bg-clip-text text-transparent">
                  Hello, Arya.
                </span>
              </p>
              <p className="text-slate-400">How can I help you today?</p>
            </div>

            {/* Drag-and-Drop Cards */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cards" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5"
                  >
                    {cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="h-[200px] p-4 bg-gray-200 rounded-lg relative cursor-pointer hover:bg-gray-300"
                          >
                            <p className="text-slate-700 text-lg">{card.text}</p>
                            <div className="text-4xl p-1 absolute bottom-2 right-2">
                              {card.icon}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        ) : (
          <div className="py-0 px-[5%] max-h-[70vh] overflow-y-scroll scrollbar-hidden">
            <div className="my-10 mx-0 flex items-center gap-5">
              <FaUserCircle className="text-3xl" />
              <p className="text-lg font-[400] leading-[1.8]">{recentPrompt}</p>
            </div>

            <div className="flex items-start gap-5">
              <img src={geminiLogo} alt="" className="w-8 rounded-[50%]" />

              {loading ? (
                <div className="w-full flex flex-col gap-2">
                  <hr className="rounded-md border-none bg-gray-200 bg-gradient-to-r from-[#81cafe] via-[#ffffff] to-[#81cafe] p-4 animate-scroll-bg" />
                  <hr className="rounded-md border-none bg-gray-200 bg-gradient-to-r from-[#81cafe] via-[#ffffff] to-[#81cafe] p-4 animate-scroll-bg" />
                  <hr className="rounded-md border-none bg-gray-200 bg-gradient-to-r from-[#81cafe] via-[#ffffff] to-[#81cafe] p-4 animate-scroll-bg" />
                </div>
              ) : (
                <p
                  dangerouslySetInnerHTML={{ __html: resultData }}
                  className="text-lg font-[400] leading-[1.8]"
                ></p>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full max-w-[900px] px-5 mx-auto mt-5">
          <div className="flex items-center justify-between gap-20 bg-gray-200 py-2 px-5 rounded-full">
            <input
              type="text"
              placeholder="Enter a prompt here..."
              className="flex-1 bg-transparent border-none outline-none p-2 text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex gap-4 items-center">
              <label htmlFor="image-upload" className="cursor-pointer">
                <MdAddPhotoAlternate className="text-2xl" />
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <FaMicrophone
                onClick={isListening ? () => recognition.stop() : startListening}
                className={`text-2xl cursor-pointer ${isListening ? 'text-red-600' : ''}`}
              />
              {input && (
                <IoMdSend
                  onClick={() => onSent()}
                  className="text-2xl cursor-pointer"
                />
              )}
            </div>
          </div>

          <p className="text-sm my-4 mx-auto text-center font-[500] text-slate-600">
            Gemini may display inaccurate info, including about people, so
            double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
