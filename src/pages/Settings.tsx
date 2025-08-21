import { Bookmark, BriefcaseBusiness, LetterText } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import CategorySettings from "@/components/CategorySettings"
import DefaultValues from "@/components/DefaultValues"

const TABS = [
	{
		value: "categories",
		label: "Categories",
		icon: Bookmark,
		content: <CategorySettings />
	}, 
	{
		value: "default-values",
		label: "Default Values",
		icon: LetterText,
		content: <DefaultValues />
	}, 
	{
		value: "business-settings",
		label: "Business Settings",
		icon: BriefcaseBusiness,
		content: <div className="text-center pt-10">Coming soon</div>
	}
]

export default function Settings() {
  return (
    <div className="max-w-5xl">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="h-fit bg-transparent rounded-none flex-nowrap overflow-x-auto justify-start w-full md:w-auto">
			{
				TABS.map((tab) => (
					<TabsTrigger 
						key={tab.value} 
						value={tab.value}
						className="rounded-none border-0 border-gray-200 py-3 px-4 border-b data-[state=active]:bg-blue-100 data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2"
					>
						<tab.icon className="mr-2 h-4 w-4" />
						{tab.label}
					</TabsTrigger>
				))
			}
        </TabsList>
		{TABS.map((tab) => (
			<TabsContent key={tab.value} value={tab.value} className="py-6">
				{tab.content}
			</TabsContent>
		))}
      </Tabs>
    </div>
  )
}
