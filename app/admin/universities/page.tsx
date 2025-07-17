"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ApiService, UniversityRegion, UniversityType } from "@/lib/api";
import { Plus, Search, Eye, Edit, Power } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUniversities();
  }, [currentPage, filterStatus]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const queryFilter =
        filterStatus === "all" ? 0 : Number.parseInt(filterStatus);
      const response = await ApiService.getAdminUniversities(
        currentPage,
        10,
        queryFilter
      );
      setUniversities(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch universities:", error);
      toast.error("Failed to fetch universities");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isDeleted: boolean) => {
    return isDeleted ? (
      <Badge variant="secondary">Inactive</Badge>
    ) : (
      <Badge variant="default">Active</Badge>
    );
  };

  const getTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "Public";
      case 1:
        return "Private";
      case 2:
        return "International";
      default:
        return "Unknown";
    }
  };

  const filteredUniversities = universities.filter((university) =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Universities</h1>
          <CreateUniversityDialog onSuccess={fetchUniversities}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add University
            </Button>
          </CreateUniversityDialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search universities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Universities List */}
        <Card>
          <CardHeader>
            <CardTitle>Universities ({filteredUniversities.length})</CardTitle>
            <CardDescription>
              {loading
                ? "Loading..."
                : `Showing ${filteredUniversities.length} universities`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUniversities.map((university) => (
                  <div
                    key={university.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {university.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {university.region} •{" "}
                              {getTypeName(university.universityType)}
                            </span>
                            {getStatusBadge(university.isDeleted)}
                          </div>
                        </div>
                      </div>
                      {university.address && (
                        <p className="text-sm text-gray-600 mt-2">
                          {university.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/universities/${university.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Power className="mr-2 h-4 w-4" />
                        {university.isDeleted ? "Activate" : "Deactivate"}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredUniversities.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No universities found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface UniversityFormData {
  name: string;
  code: string;
  region: UniversityRegion;
  universityType: UniversityType;
  address?: string;
  email?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  title?: string;
  content?: string;
}

function CreateUniversityDialog({ children, onSuccess }: { children?: React.ReactNode, onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<UniversityFormData>({
    name: "",
    code: "",
    region: UniversityRegion.North,
    universityType: UniversityType.Public,
    address: "",
    email: "",
    websiteUrl: "",
    facebookUrl: "",
    title: "",
    content: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: parseInt(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await ApiService.createUniversity(formData);

      if (!response.isSuccess) {
        throw new Error("Failed to create university");
      }

      // Close dialog and reset form on success
      setOpen(false);
      setFormData({
        name: "",
        code: "",
        region: UniversityRegion.North,
        universityType: UniversityType.Public,
        address: "",
        websiteUrl: "",
        facebookUrl: "",
        title: "",
        content: "",
      });

      onSuccess && onSuccess();
    } catch (error) {
      console.error("Error creating university:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Create University</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create University</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new university.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="University name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="University code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select
                value={formData.region.toString()}
                onValueChange={(value) => handleSelectChange("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UniversityRegion.North.toString()}>North</SelectItem>
                  <SelectItem value={UniversityRegion.Middle.toString()}>Central</SelectItem>
                  <SelectItem value={UniversityRegion.South.toString()}>South</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="universityType">University Type *</Label>
              <Select
                value={formData.universityType.toString()}
                onValueChange={(value) => handleSelectChange("universityType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UniversityType.Public.toString()}>Public</SelectItem>
                  <SelectItem value={UniversityType.Private.toString()}>Private</SelectItem>
                  <SelectItem value={UniversityType.International.toString()}>International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              placeholder="Full address" 
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="contact@university.edu.vn"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input 
                id="websiteUrl" 
                type="url" 
                placeholder="https://example.com" 
                value={formData.websiteUrl}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input 
                id="facebookUrl" 
                type="url" 
                placeholder="https://facebook.com/username" 
                value={formData.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Short title" 
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea 
              id="content" 
              placeholder="Detailed description about the university" 
              className="min-h-[120px]" 
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create University'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}