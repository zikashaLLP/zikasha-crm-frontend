import { FilePlus, Bookmark, List, BellDot } from "lucide-react"

const FEATURES = [
  {
    title: "Manage Customer Inquiries",
    description: "Easily create and manage customer inquiries. Add conversation logs to keep a detailed record of all interactions.",
    icon: <FilePlus className="w-8 h-8 text-[#2b7fff] pt-1" />
  },
  {
    title: "Categorize Inquiries",
    description: "Organize inquiries into categories for faster access and more efficient tracking.",
    icon: <Bookmark className="w-8 h-8 text-[#2b7fff] pt-1" />
  },
  {
    title: "Add Custom Categories",
    description: "Create your own custom categories to organize inquiries in a way that best suits your workflow and preferences.",
    icon: <List className="w-8 h-8 text-[#2b7fff] pt-1" />
  },
  {
    title: "Receive Timely Reminders",
    description: "Stay on top of your follow-ups with automated reminders that help you engage with customers at the right time.",
    icon: <BellDot className="w-8 h-8 text-[#2b7fff] pt-1" />
  }
];


const Features = () => {
    return (
        <div className="max-h-screen h-full flex flex-col px-6 items-center overflow-y-auto py-6 md:py-18 gap-6">

            {
                FEATURES?.map((feature, index) => (
                    <div 
                        key={index}
                        className="feature-item flex gap-5 bg-white rounded-lg shadow max-w-[600px] w-full p-6"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="">
                            {feature.icon}
                        </div>
                        <div className="w-full">
                            <h1 className="text-lg font-semibold">{feature.title}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))
            }

        </div>
    )
}

export default Features