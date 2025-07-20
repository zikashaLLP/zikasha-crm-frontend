// types.ts - Type definitions
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

export interface Category {
  id: number | string;
  name: string;
  slug?: string;
  color?: string;
  exclude_from_search?: boolean;
  createdAt?: string;
  updatedAt?: string;
  agency_id?: number;
}

export interface Inquiry {
  id: number;
  createdAt: string;
  location?: string;
  followup_date?: string;
  category_id?: number;
  latest_log?: string;
  Customer?: Customer;
  Category?: Category;
}

export interface Log {
  id: number;
  content: string;
  createdAt: string;
  inquiry_id: number;
}

export interface DateRange {
  followup_date_start: string;
  followup_date_end: string;
}

export type DateRangeType = 'today' | 'tomorrow' | 'this-week' | 'next-week';

// Dashboard.tsx - Main component with TypeScript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";

import { Button } from "@/components/ui/button";
import { Plus, User, Phone, CalendarIcon, MapPinIcon, ContactIcon, MailIcon, MoreVerticalIcon, NotebookIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getDateRange } from "@/utils/dates"

import AddLogForm from "@/components/AddLogForm";
import ViewLogs from "@/components/ViewLogs";
import { Badge } from "@/components/ui/badge";

// Props interface for CategoryCard component
interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onClick: () => void;
}

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ categoriesLoaded, setCategoriesLoaded ] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>('all');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesCount, setinquiriesCount] = useState<number>(0);
  const [loadingInquiries, setLoadingInquiries] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 768);

  // Listen for screen resize to update isDesktop
  useEffect(() => {
    const handleResize = (): void => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

  // Load categories once.
  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then((res) => {
        setCategories(res.data)
        setCategoriesLoaded(true);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  // Load inquiries when selectedCategoryId changes.
  useEffect(() => {
    setLoadingInquiries(true);

    let url = selectedCategoryId
      ? `/inquiries?category_id=${selectedCategoryId}`
      : "/inquiries";

    console.log("selectedCategoryId", selectedCategoryId, categoriesLoaded);
    

    if (selectedCategoryId === 'all' && ! categoriesLoaded) {
      return; // Don't fetch inquiries if categories are not loaded yet
    }

    if (selectedCategoryId === 'all') {
      const cats = categories.filter(cat => cat.exclude_from_search);
      if (cats.length > 0) {
        url = `/inquiries?exclude_categories=${cats.map(cat => cat.id).join(',')}`;
      } else {
        url = '/inquiries';
      }
    }
    
    if (
      selectedCategoryId &&
      ['today', 'tomorrow', 'this-week', 'next-week'].includes(selectedCategoryId as string)
    ) {
      let { followup_date_start, followup_date_end } = getDateRange(selectedCategoryId as DateRangeType);
      
      if (followup_date_start && followup_date_end) {
        url = `/inquiries?followup_date_start=${followup_date_start.toUTCString() }&followup_date_end=${followup_date_end.toUTCString()}`;
      }
    }

    if (
      selectedCategoryId &&
      selectedCategoryId === 'backlog'
    ) {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      url = `/inquiries?followup_date_start=1970-01-01T00:00:00.000Z&followup_date_end=${startOfToday.toUTCString()}`;
    }

    api
      .get(url)
      .then((res) => {
        setInquiries(res.data.inquiries)
        setinquiriesCount(res.data.total);
      })
      .catch(() => toast.error("Failed to load inquiries"))
      .finally(() => setLoadingInquiries(false));
  }, [selectedCategoryId, categoriesLoaded]);

  const handleInquiryClick = (inquiry: Inquiry): void => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  };

  const handleContactClick = (inquiry: Inquiry): void => {
    setSelectedInquiry(inquiry);
    setShowContactModal(true);
  };


  const deleteInquiry = async (inquiryId: number): Promise<void> => {
    try {
      await api.delete(`/inquiries/${inquiryId}`);
      toast.success("Inquiry deleted successfully");
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
    } catch (error) {
      toast.error("Failed to delete inquiry");
    }
  };

  const handleCategoryClick = (categoryId: number | string | null): void => {
    setSelectedCategoryId(categoryId);
  };

  const openExternalLink = (url: string): void => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })?.toUpperCase();
    return `${dateStr}  ${timeStr}`;
  };

  const getSectionTitle = (): string => {
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      return `${category?.name || ""} Inquiries`;
    }
    return "All Inquiries";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg md:text-2xl font-bold">Inquiries</h1>
        <Button asChild>
          <Link to="/dashboard/inquiries/new">
            <Plus />
            Add Inquiry
          </Link>
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        {/* Add an "All" card */}
        <CategoryCard
          category={{ id: 'all', name: "All" }}
          selected={selectedCategoryId === null}
          onClick={() => handleCategoryClick('all')}
        />

        <CategoryCard
          category={{ id: 'today', name: "Today's calls" }}
          selected={selectedCategoryId === 'today'}
          onClick={() => handleCategoryClick('today')}
        />

        <CategoryCard
          category={{ id: 'tomorrow', name: "Tomorrow's calls" }}
          selected={selectedCategoryId === 'tomorrow'}
          onClick={() => handleCategoryClick('tomorrow')}
        />

        <CategoryCard
          category={{ id: 'this-week', name: "This Week" }}
          selected={selectedCategoryId === 'this-week'}
          onClick={() => handleCategoryClick('this-week')}
        />

        <CategoryCard
          category={{ id: 'next-week', name: "Next Week" }}
          selected={selectedCategoryId === 'next-week'}
          onClick={() => handleCategoryClick('next-week')}
        />

        <CategoryCard
          category={{ id: 'backlog', name: "Backlog" }}
          selected={selectedCategoryId === 'backlog'}
          onClick={() => handleCategoryClick('backlog')}
        />

        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selectedCategoryId === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>

      {/* Inquiries list */}
      <section>
        <h2 className="mb-4 text-base font-semibold">
          {getSectionTitle()} <Badge className="ml-2">{inquiriesCount}</Badge>
        </h2>

        {loadingInquiries ? (
          <Loading />
        ) : inquiries?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No inquiry found!</p>
        ) : (
          <>
            {isDesktop && (
              <div className="overflow-x-auto rounded-md border mb-8">
                <table className="w-full table-auto border-collapse bg-white">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                      <th className="px-4 py-2 text-left font-semibold">Client</th>
                      <th className="px-4 py-2 text-left font-semibold">Contact No.</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                      <th className="px-4 py-2 text-left font-semibold">Location</th>
                      <th className="px-4 py-2 text-left font-semibold">Follow-up Date</th>
                      <th className="px-4 py-2 text-left font-semibold">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className={`hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedInquiry?.id === inquiry.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <td className="px-4 py-2">
                          {formatDate(inquiry.createdAt)}
                        </td>
                        <td
                          className="px-4 py-2 cursor-pointer"
                          onClick={() => handleContactClick(inquiry)}
                        >
                          {inquiry.Customer?.name || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {inquiry.Customer?.phone || "N/A"}
                        </td>
                        <td
                          className="px-4 py-2 cursor-pointer"
                          onClick={() => handleInquiryClick(inquiry)}
                        >
                          {inquiry.Category?.name ? (
                            <code className="px-2 py-1 bg-blue-100 rounded">
                              {inquiry.Category.name}
                            </code>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{inquiry.location || "-"}</td>
                        <td className="px-4 py-2 font-semibold text-xs text-muted-foreground">
                          {inquiry.followup_date ? formatDateTime(inquiry.followup_date) : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVerticalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleInquiryClick(inquiry)}>
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactClick(inquiry)}>
                                View Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInquiry(inquiry);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 hover:text-red-800 focus:bg-red-100 focus:text-red-700"
                              >
                                Delete Inquiry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile view */}
            {!isDesktop && inquiries?.length > 0 && (
              <div>
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-3 mb-10 relative border rounded-lg">
                    <div className="p-0">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {formatDate(inquiry.createdAt)}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVerticalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleInquiryClick(inquiry)}>
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactClick(inquiry)}>
                                View Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInquiry(inquiry);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 hover:text-red-800 focus:bg-red-100 focus:text-red-700"
                              >
                                Delete Inquiry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          <span className="font-semibold">
                            {inquiry.Customer?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex gap-5">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            <span>
                              {inquiry.followup_date ? formatDateTime(inquiry.followup_date) : "-"}
                            </span>
                          </div>
                        </div>

                        {inquiry.location && (
                          <div className="text-sm flex items-center gap-1">
                            <MapPinIcon className="w-5 h-5" />
                            {inquiry.location}
                          </div>
                        )}
                        {inquiry.latest_log && (
                          <div className="flex items-center gap-2">
                            <NotebookIcon className="w-5 h-5" />
                            <span>{inquiry.latest_log}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 mb-2">
                          <code
                            className="px-2 py-1 bg-blue-100 rounded cursor-pointer"
                            onClick={() => handleInquiryClick(inquiry)}
                          >
                            {inquiry.Category?.name || "N/A"}
                          </code>
                        </div>
                      </div>
                      <div className="absolute -bottom-6 left-4">
                        <div className="flex gap-2">
                          {inquiry.Customer?.phone && inquiry.Customer.phone !== "" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                                onClick={() => openExternalLink(`tel:+91${inquiry.Customer?.phone}`)}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
                                onClick={() => openExternalLink(`https://wa.me/91${inquiry.Customer?.phone}`)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                </svg>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Delete Inquiry Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this inquiry?</p>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedInquiry) {
                  deleteInquiry(selectedInquiry.id);
                  setSelectedInquiry(null);
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Details Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="min-w-fit max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Contact Details
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="md:p-4 md:border rounded-md space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                {selectedInquiry.Customer?.name && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <p>{selectedInquiry.Customer.name}</p>
                  </div>
                )}
                {selectedInquiry.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <p>{selectedInquiry.location}</p>
                  </div>
                )}
                {selectedInquiry.Customer?.phone && (
                  <div className="flex items-center gap-2">
                    <ContactIcon className="w-5 h-5" />
                    <p>+91 {selectedInquiry.Customer.phone}</p>
                  </div>
                )}
                {selectedInquiry.followup_date && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <p>{formatDateTime(selectedInquiry.followup_date)}</p>
                  </div>
                )}
              </div>
              <hr className="hidden md:block" />
              <div className="flex gap-4 items-center">
                {selectedInquiry.Customer?.email && selectedInquiry.Customer.email !== "" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-200 hover:bg-red-300 ring-blue-100"
                    onClick={() => openExternalLink(`mailto:${selectedInquiry.Customer?.email}`)}
                  >
                    <MailIcon className="w-4 h-4" />
                    Email
                  </Button>
                )}
                {selectedInquiry.Customer?.phone && selectedInquiry.Customer.phone !== "" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                      onClick={() => openExternalLink(`tel:+91${selectedInquiry?.Customer?.phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
                      onClick={() => openExternalLink(`https://wa.me/91${selectedInquiry?.Customer?.phone}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                      </svg>
                      WhatsApp
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiry Details Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent className="min-w-fit max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Inquiry Details
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <Tabs defaultValue="view-log">
              <TabsList className="grid w-full grid-cols-3 p-1 h-auto bg-gray-100">
                <TabsTrigger className="p-2" value="view-log">View Log</TabsTrigger>
                <TabsTrigger className="p-2" value="add-log">Add Log</TabsTrigger>
                <TabsTrigger className="p-2" value="add-visit">Add Visit</TabsTrigger>
              </TabsList>
              <TabsContent value="view-log">
                <div className="p-4 border rounded-md max-h-[60vh] overflow-y-auto">
                  <ViewLogs inquiryId={selectedInquiry.id} />
                </div>
              </TabsContent>
              <TabsContent value="add-log">
                <div className="p-4 border rounded-md">
                  <AddLogForm
                    categories={categories}
                    category_id={selectedInquiry.category_id}
                    inquiry_id={selectedInquiry.id}
                    setShowInquiryModal={setShowInquiryModal}
                  />
                </div>
              </TabsContent>
              <TabsContent value="add-visit">Add Visit</TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// CategoryCard component with proper TypeScript typing
function CategoryCard({ category, selected, onClick }: CategoryCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer rounded-lg border p-4 transition ${
        selected
          ? "ring-2 ring-blue-500 bg-blue-100"
          : "border hover:shadow-sm"
      }`}
    >
      <h3 className="font-medium text-gray-900">{category.name}</h3>
    </div>
  );
}