interface RadioGroupProps {
  label: string;
  options: string[];
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
}) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-4 mt-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={label}
              className="accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
