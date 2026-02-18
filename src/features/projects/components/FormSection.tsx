import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="bg-primary text-white px-6 py-3 font-semibold">
        {title}
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
