import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus, ImageIcon } from "lucide-react";

interface Employee {
  id: string;
  user_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  date_joined: string;
  position: string | null;
  department: string | null;
  phone: string | null;
  employee_card_photo_url: string | null;
  id_card_photo_url: string | null;
  certificate_photo_url: string | null;
  certificate_expiry_date: string | null;
  employee_card_photos: string[] | null;
  id_card_photos: string[] | null;
  certificate_photos: string[] | null;
}

interface UserProfile {
  id: string;
  full_name: string;
}

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

interface PendingFile {
  file: File;
  preview: string;
}

interface PhotoUploadSectionProps {
  label: string;
  existingUrls: string[];
  pendingFiles: PendingFile[];
  onAddFiles: (files: FileList) => void;
  onRemoveExisting: (index: number) => void;
  onRemovePending: (index: number) => void;
  maxImages?: number;
}

const PhotoUploadSection = ({
  label,
  existingUrls,
  pendingFiles,
  onAddFiles,
  onRemoveExisting,
  onRemovePending,
  maxImages = 5,
}: PhotoUploadSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalImages = existingUrls.length + pendingFiles.length;
  const canAddMore = totalImages < maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label} ({totalImages}/{maxImages})</Label>
      <div className="flex flex-wrap gap-2">
        {/* Existing images */}
        {existingUrls.map((url, index) => (
          <div key={`existing-${index}`} className="relative group">
            <img
              src={url}
              alt={`${label} ${index + 1}`}
              className="w-16 h-16 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => onRemoveExisting(index)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Pending files previews */}
        {pendingFiles.map((pending, index) => (
          <div key={`pending-${index}`} className="relative group">
            <img
              src={pending.preview}
              alt={`Pending ${index + 1}`}
              className="w-16 h-16 object-cover rounded-lg border-2 border-dashed border-primary"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-primary font-medium bg-background/80 px-1 rounded">Mới</span>
            </div>
            <button
              type="button"
              onClick={() => onRemovePending(index)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-0.5 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Thêm</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export const EmployeeDialog = ({ open, onOpenChange, employee, onSuccess }: EmployeeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    date_joined: new Date().toISOString().split("T")[0],
    position: "",
    department: "",
    phone: "",
    email: "",
    password: "",
    certificate_expiry_date: "",
  });

  // Photo states - existing URLs
  const [employeeCardPhotos, setEmployeeCardPhotos] = useState<string[]>([]);
  const [idCardPhotos, setIdCardPhotos] = useState<string[]>([]);
  const [certificatePhotos, setCertificatePhotos] = useState<string[]>([]);

  // Photo states - pending files
  const [employeeCardPending, setEmployeeCardPending] = useState<PendingFile[]>([]);
  const [idCardPending, setIdCardPending] = useState<PendingFile[]>([]);
  const [certificatePending, setCertificatePending] = useState<PendingFile[]>([]);

  // URLs to delete
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

  const { toast } = useToast();

  // Fetch available user accounts
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (data) setUsers(data);
    };
    if (open) fetchUsers();
  }, [open]);

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name,
        date_of_birth: employee.date_of_birth || "",
        date_joined: employee.date_joined,
        position: employee.position || "",
        department: employee.department || "",
        phone: employee.phone || "",
        email: "",
        password: "",
        certificate_expiry_date: employee.certificate_expiry_date || "",
      });
      setSelectedUserId(employee.user_id);

      // Load existing photos (prefer array fields, fall back to legacy single URL)
      setEmployeeCardPhotos(
        employee.employee_card_photos?.length
          ? employee.employee_card_photos
          : employee.employee_card_photo_url
            ? [employee.employee_card_photo_url]
            : []
      );
      setIdCardPhotos(
        employee.id_card_photos?.length
          ? employee.id_card_photos
          : employee.id_card_photo_url
            ? [employee.id_card_photo_url]
            : []
      );
      setCertificatePhotos(
        employee.certificate_photos?.length
          ? employee.certificate_photos
          : employee.certificate_photo_url
            ? [employee.certificate_photo_url]
            : []
      );
    } else {
      setFormData({
        full_name: "",
        date_of_birth: "",
        date_joined: new Date().toISOString().split("T")[0],
        position: "",
        department: "",
        phone: "",
        email: "",
        password: "",
        certificate_expiry_date: "",
      });
      setSelectedUserId(null);
      setEmployeeCardPhotos([]);
      setIdCardPhotos([]);
      setCertificatePhotos([]);
    }

    // Reset pending files when dialog opens/closes
    setEmployeeCardPending([]);
    setIdCardPending([]);
    setCertificatePending([]);
    setUrlsToDelete([]);
  }, [employee, open]);

  const addPendingFiles = (
    files: FileList,
    existingCount: number,
    setPending: React.Dispatch<React.SetStateAction<PendingFile[]>>,
    pendingCount: number,
    maxImages: number = 5
  ) => {
    const remainingSlots = maxImages - existingCount - pendingCount;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPending((prev) => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPhotos = async (pendingFiles: PendingFile[], folder: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const pending of pendingFiles) {
      const fileExt = pending.file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-photos")
        .upload(filePath, pending.file);

      if (!uploadError) {
        const { data } = supabase.storage.from("employee-photos").getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const deletePhotosFromStorage = async (urls: string[]) => {
    for (const url of urls) {
      try {
        const path = url.split("/employee-photos/")[1];
        if (path) {
          await supabase.storage.from("employee-photos").remove([path]);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = employee?.user_id || null;

      // Create user account if email and password provided
      if (!employee && formData.email && formData.password) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error("Không có quyền truy cập");

        const response = await supabase.functions.invoke("admin-create-user", {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.full_name,
          },
        });

        if (response.error) throw response.error;
        userId = response.data?.user?.user?.id || null;
      }

      // Delete removed photos from storage
      if (urlsToDelete.length > 0) {
        await deletePhotosFromStorage(urlsToDelete);
      }

      // Upload new photos
      const newEmployeeCardUrls = await uploadPhotos(employeeCardPending, "employee-cards");
      const newIdCardUrls = await uploadPhotos(idCardPending, "id-cards");
      const newCertificateUrls = await uploadPhotos(certificatePending, "certificates");

      // Combine existing and new URLs
      const finalEmployeeCardPhotos = [...employeeCardPhotos, ...newEmployeeCardUrls];
      const finalIdCardPhotos = [...idCardPhotos, ...newIdCardUrls];
      const finalCertificatePhotos = [...certificatePhotos, ...newCertificateUrls];

      const finalUserId = employee ? (selectedUserId || null) : (userId || null);

      const employeeData = {
        user_id: finalUserId || null,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        date_joined: formData.date_joined,
        position: formData.position || null,
        department: formData.department || null,
        phone: formData.phone || null,
        certificate_expiry_date: formData.certificate_expiry_date || null,
        // New array fields
        employee_card_photos: finalEmployeeCardPhotos,
        id_card_photos: finalIdCardPhotos,
        certificate_photos: finalCertificatePhotos,
        // Keep legacy fields updated with first photo (for backward compatibility)
        employee_card_photo_url: finalEmployeeCardPhotos[0] || null,
        id_card_photo_url: finalIdCardPhotos[0] || null,
        certificate_photo_url: finalCertificatePhotos[0] || null,
      };

      if (employee) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employee.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert(employeeData);

        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: employee ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên mới",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExisting = (
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>,
    photos: string[],
    index: number
  ) => {
    const urlToRemove = photos[index];
    setUrlsToDelete((prev) => [...prev, urlToRemove]);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Họ tên *</Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Ngày sinh</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date_joined">Ngày vào làm *</Label>
              <Input
                id="date_joined"
                type="date"
                required
                value={formData.date_joined}
                onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="position">Chức vụ</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="department">Phòng ban</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="certificate_expiry_date">Ngày hết hạn bằng cấp</Label>
              <Input
                id="certificate_expiry_date"
                type="date"
                value={formData.certificate_expiry_date}
                onChange={(e) => setFormData({ ...formData, certificate_expiry_date: e.target.value })}
              />
            </div>

            {employee ? (
              <div>
                <Label htmlFor="user_account">Liên kết tài khoản</Label>
                <Select
                  value={selectedUserId || "none"}
                  onValueChange={(value) => setSelectedUserId(value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tài khoản người dùng" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="none">-- Không liên kết --</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="email">Email đăng nhập</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Để trống nếu không cần tài khoản"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Để trống nếu không cần tài khoản"
                  />
                </div>
              </>
            )}
          </div>

          {/* Photo upload sections */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-sm text-muted-foreground">Hình ảnh nhân viên</h3>
            
            <PhotoUploadSection
              label="Ảnh CMND/CCCD (mặt trước & sau)"
              existingUrls={idCardPhotos}
              pendingFiles={idCardPending}
              onAddFiles={(files) => addPendingFiles(files, idCardPhotos.length, setIdCardPending, idCardPending.length)}
              onRemoveExisting={(index) => handleRemoveExisting(setIdCardPhotos, idCardPhotos, index)}
              onRemovePending={(index) => setIdCardPending((prev) => prev.filter((_, i) => i !== index))}
              maxImages={2}
            />

            <PhotoUploadSection
              label="Ảnh thẻ nhân viên"
              existingUrls={employeeCardPhotos}
              pendingFiles={employeeCardPending}
              onAddFiles={(files) => addPendingFiles(files, employeeCardPhotos.length, setEmployeeCardPending, employeeCardPending.length)}
              onRemoveExisting={(index) => handleRemoveExisting(setEmployeeCardPhotos, employeeCardPhotos, index)}
              onRemovePending={(index) => setEmployeeCardPending((prev) => prev.filter((_, i) => i !== index))}
              maxImages={2}
            />

            <PhotoUploadSection
              label="Ảnh bằng cấp/chứng chỉ"
              existingUrls={certificatePhotos}
              pendingFiles={certificatePending}
              onAddFiles={(files) => addPendingFiles(files, certificatePhotos.length, setCertificatePending, certificatePending.length)}
              onRemoveExisting={(index) => handleRemoveExisting(setCertificatePhotos, certificatePhotos, index)}
              onRemovePending={(index) => setCertificatePending((prev) => prev.filter((_, i) => i !== index))}
              maxImages={10}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employee ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};