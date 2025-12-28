import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DynamicSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Choose or add new",
  addNewLabel = "Add new",
  required = false 
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm) {
      setFilteredOptions(
        options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const handleAddNew = () => {
    if (newItem.trim()) {
      const newOption = {
        id: newItem.toLowerCase().replace(/\s+/g, '_'),
        label: newItem.trim()
      };
      
      // Add to options (this would typically be saved to backend)
      const updatedOptions = [...options, newOption];
      onChange(newOption.id);
      setNewItem("");
      setIsAddingNew(false);
      
      toast({
        title: "New item added successfully",
        description: `${newOption.label} added to the list`
      });
    }
  };

  const handleCancel = () => {
    setNewItem("");
    setIsAddingNew(false);
  };

  const selectedOption = options.find(option => option.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-luxury-navy/50 border border-luxury-gold/30 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
          required={required}
        >
          <option value="">{placeholder}</option>
          {filteredOptions.map((option) => (
            <option key={option.id} value={option.id} className="bg-luxury-navy">
              {option.label}
            </option>
          ))}
        </select>
        
        {!isAddingNew && (
          <Button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-luxury-gold/20 hover:bg-luxury-gold/30 text-luxury-gold p-1 h-6 w-6"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isAddingNew && (
        <div className="flex gap-2 p-3 bg-luxury-navy/30 rounded-lg border border-luxury-gold/20">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}`}
            className="flex-1 bg-luxury-navy/50 border-luxury-gold/30 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
          />
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white p-2"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {selectedOption && (
        <p className="text-xs text-luxury-gold/70">
          Selected: {selectedOption.label}
        </p>
      )}
    </div>
  );
};

export default DynamicSelect;
