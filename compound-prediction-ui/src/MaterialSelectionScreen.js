import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { MATERIALS, DEFAULT_MATERIAL_COUNTS } from "./constants";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "./animationConfig";

// Custom searchable dropdown component
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // We'll use a portal to render the dropdown outside the regular DOM hierarchy
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Create a container for the portal
    if (typeof document !== "undefined") {
      // Check if the portal container already exists
      let container = document.getElementById("dropdown-portal-container");

      if (!container) {
        // Create it if it doesn't exist
        container = document.createElement("div");
        container.id = "dropdown-portal-container";
        container.style.position = "fixed";
        container.style.zIndex = "10000";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.pointerEvents = "none"; // Allow clicks to pass through the container
        document.body.appendChild(container);
      }

      setPortalContainer(container);
    }

    return () => {
      // Cleanup not needed for the container itself as we reuse it
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Calculate dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is inside the portal
        const portalElement = document.querySelector(
          ".searchable-dropdown-menu"
        );
        if (portalElement && !portalElement.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Update position on scroll and resize
      window.addEventListener("scroll", updateDropdownPosition);
      window.addEventListener("resize", updateDropdownPosition);

      return () => {
        window.removeEventListener("scroll", updateDropdownPosition);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen]);

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Small delay before updating position
      setTimeout(updateDropdownPosition, 0);
    }
  };

  // Create dropdown component that will be rendered in the portal
  const renderDropdown = () => {
    if (!isOpen || !portalContainer) return null;

    const dropdownContent = (
      <div
        className="searchable-dropdown-menu absolute shadow-lg border rounded-lg bg-white overflow-hidden"
        style={{
          position: "absolute",
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          pointerEvents: "auto", // Make this element interactive
          zIndex: 10001,
        }}
      >
        {/* Search input */}
        <div className="relative p-2 border-b">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search materials..."
            className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute left-4 top-4 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchTerm("");
              }}
              className="absolute right-4 top-4.5 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Options list */}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`p-2 hover:bg-purple-100 cursor-pointer ${
                  value === option ? "bg-purple-100" : ""
                }`}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 text-center">
              No materials found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    );

    // Use ReactDOM portal to render the dropdown
    return ReactDOM.createPortal(dropdownContent, portalContainer);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected value display / dropdown trigger */}
      <div
        onClick={handleToggleDropdown}
        className="w-full p-2 border rounded-lg cursor-pointer flex justify-between items-center bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <span className={`${!value && "text-gray-500"}`}>
          {value || placeholder || `Select Material ${index + 1}`}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>

      {/* Render dropdown in portal */}
      {renderDropdown()}
    </div>
  );
};

const MaterialSelectionScreen = ({
  numberOfMaterials,
  setNumberOfMaterials,
  materialSelections,
  setMaterialSelections,
  customMaterialCount,
  setCustomMaterialCount,
  onProceed,
  onBack,
}) => {
  // Handle number of materials selection
  const handleMaterialNumberSelect = (num) => {
    setNumberOfMaterials(num);
    setMaterialSelections(new Array(num).fill(null));
    setCustomMaterialCount("");
  };

  // Handle custom material count input
  const handleCustomMaterialCountChange = (e) => {
    const value = e.target.value;
    setCustomMaterialCount(value);

    // Only update if the value is a positive number
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setNumberOfMaterials(count);
      setMaterialSelections(new Array(count).fill(null));
    }
  };

  // Update material selection
  const handleMaterialSelectionChange = (index, value) => {
    const newSelections = [...materialSelections];
    newSelections[index] = value;
    setMaterialSelections(newSelections);
  };

  // Get available materials (excluding already selected materials)
  const getAvailableMaterials = (currentIndex) => {
    return MATERIALS.filter(
      (material) =>
        !materialSelections.some(
          (selected, index) => selected === material && index !== currentIndex
        )
    );
  };

  // Handle form submission
  const handleProceedToComposition = () => {
    // Validate all materials are selected
    if (materialSelections.some((selection) => selection === null)) {
      alert("Please select all materials");
      return;
    }
    onProceed();
  };

  return (
    <motion.div
      key="material-selection"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-[30rem]"
      style={{ position: "relative", zIndex: 1 }}
    >
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold mb-6 text-purple-600"
      >
        Select Number of Raw Materials
      </motion.h2>
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {DEFAULT_MATERIAL_COUNTS.map((num, idx) => (
          <motion.button
            key={num}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleMaterialNumberSelect(num)}
            className={`py-2 px-4 rounded-lg transition-all ${
              numberOfMaterials === num
                ? "bg-purple-500 text-white"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            {num} Materials
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <motion.input
          variants={itemVariants}
          type="number"
          placeholder="Or enter custom number of materials"
          value={customMaterialCount}
          onChange={handleCustomMaterialCountChange}
          min="1"
          max="62"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </motion.div>

      {numberOfMaterials > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto mb-4"
          >
            {materialSelections.map((selection, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.4,
                }}
                className="relative"
              >
                <SearchableDropdown
                  options={getAvailableMaterials(index)}
                  value={selection}
                  onChange={(value) =>
                    handleMaterialSelectionChange(index, value)
                  }
                  placeholder={`Select Material ${index + 1}`}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex space-x-4 mt-6">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onBack}
              className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.3 + materialSelections.length * 0.1 }}
              onClick={handleProceedToComposition}
              className="w-1/2 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Proceed to Composition
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MaterialSelectionScreen;
