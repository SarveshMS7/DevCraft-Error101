import FormSection from "../components/FormSection";
import InputField from "../components/InputField";
import RadioGroup from "../components/RadioGroup";

const CreateTeam: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-center text-primary mb-8">
          Team Up Now: Register and Find Teammates Today!
        </h2>

        <FormSection title="Hackathon Details">
          <InputField label="Team Name *" placeholder="Enter team's name" />
          <InputField label="Hackathon Name *" placeholder="Enter hackathon name" />
          <InputField label="Registration Link *" placeholder="Enter registration link" />

          <RadioGroup
            label="Hackathon Mode *"
            options={["Online", "Offline", "Hybrid"]}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Last Date of Registration *"
              type="date"
            />
            <InputField
              label="Location *"
              placeholder="Mumbai, Maharashtra or Online"
            />
          </div>
        </FormSection>

        <FormSection title="Team Member Requirements">
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Team Members Needed *"
              type="number"
              placeholder="1 - 5"
            />
            <InputField
              label="Role *"
              placeholder="Backend, Frontend..."
            />
          </div>

          <InputField
            label="Required Skills *"
            placeholder="JavaScript, Python, C++..."
          />

          <InputField
            label="Minimum Experience Level *"
            placeholder="e.g. 1+ years"
          />
        </FormSection>

        <FormSection title="Additional Details">
          <textarea
            rows={4}
            placeholder="Mention additional details..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </FormSection>

        <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Submit
        </button>
      </div>
    </div>
  );
};

export default CreateTeam;
