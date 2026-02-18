interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
      />
    </div>
  );
};

export default InputField;
