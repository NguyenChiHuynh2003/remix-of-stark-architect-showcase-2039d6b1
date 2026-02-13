import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, FileOutput, ArrowLeftRight, Undo2 } from "lucide-react";
import { AssetAllocationList } from "./AssetAllocationList";
import { GINList } from "./GINList";

export function AssetAllocationSection() {
  const [activeTab, setActiveTab] = useState("allocation");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger 
            value="allocation" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            <UserCog className="h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Phân Bổ Tài Sản</span>
              <span className="text-xs opacity-80 flex items-center gap-1">
                <Undo2 className="h-3 w-3" />
                Có thể hoàn trả
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="issue" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            <FileOutput className="h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Xuất Kho</span>
              <span className="text-xs opacity-80 flex items-center gap-1">
                <ArrowLeftRight className="h-3 w-3 line-through" />
                Không hoàn trả
              </span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="mt-4">
          <div className="p-3 mb-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <UserCog className="h-5 w-5" />
              <div>
                <p className="font-medium">Phân bổ tài sản cho nhân viên sử dụng</p>
                <p className="text-sm opacity-80">
                  Tài sản sau khi phân bổ sẽ được theo dõi và có thể hoàn trả lại kho khi không sử dụng
                </p>
              </div>
            </div>
          </div>
          <AssetAllocationList />
        </TabsContent>

        <TabsContent value="issue" className="mt-4">
          <div className="p-3 mb-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <FileOutput className="h-5 w-5" />
              <div>
                <p className="font-medium">Xuất kho vật tư tiêu hao</p>
                <p className="text-sm opacity-80">
                  Tài sản/vật tư xuất kho sẽ không thể hoàn trả. Thường dùng cho vật tư tiêu hao, nguyên vật liệu
                </p>
              </div>
            </div>
          </div>
          <GINList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
