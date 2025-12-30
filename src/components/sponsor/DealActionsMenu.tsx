import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Pause, 
  Play,
  CalendarDays,
  DollarSign,
  FileText,
  LogOut,
  XCircle,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { SponsorDeal } from "@/hooks/useSponsorDeals";
import {
  PauseResumeModal,
  CloseEarlyModal,
  ExtendDeadlineModal,
  RecordDistributionModal,
  UploadUpdateModal,
  ExitDealModal,
} from "./DealActionModals";

interface DealActionsMenuProps {
  deal: SponsorDeal;
  onUpdate: () => void;
  trigger?: React.ReactNode;
}

export function DealActionsMenu({ deal, onUpdate, trigger }: DealActionsMenuProps) {
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const isPaused = deal.status === "paused";
  const isActive = deal.status === "active" || isPaused;
  const isFunded = deal.status === "funded";
  const isDraft = deal.status === "draft";
  const canEdit = isDraft || isActive;
  const canPause = isActive;
  const canClose = isActive;
  const canExtend = isActive;
  const canDistribute = isFunded || deal.status === "active";
  const canUpdate = isActive || isFunded;
  const canExit = isFunded;

  const handlePauseResume = () => {
    toast.success(isPaused ? "Deal resumed successfully" : "Deal paused successfully");
    setPauseModalOpen(false);
    onUpdate();
  };

  const handleCloseEarly = () => {
    toast.success("Deal closed successfully. Investors have been notified.");
    setCloseModalOpen(false);
    onUpdate();
  };

  const handleExtendDeadline = (newDate: Date, notifyInvestors: boolean) => {
    toast.success(`Deadline extended to ${newDate.toLocaleDateString()}${notifyInvestors ? ". Investors have been notified." : ""}`);
    setExtendModalOpen(false);
    onUpdate();
  };

  const handleRecordDistribution = (data: any) => {
    toast.success(`Distribution of $${data.amount.toLocaleString()} recorded successfully. Investors have been notified.`);
    setDistributionModalOpen(false);
    onUpdate();
  };

  const handleUploadUpdate = (data: any) => {
    toast.success(`Update "${data.title}" posted successfully${data.notifyInvestors ? ". Investors have been notified." : ""}`);
    setUpdateModalOpen(false);
    onUpdate();
  };

  const handleExitDeal = (data: any) => {
    toast.success("Deal exited successfully. Final distributions will be processed.");
    setExitModalOpen(false);
    onUpdate();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`/sponsor/deals/${deal.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link to={`/sponsor/deals/${deal.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {canPause && (
            <DropdownMenuItem onClick={() => setPauseModalOpen(true)}>
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Raise
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Raise
                </>
              )}
            </DropdownMenuItem>
          )}
          
          {canExtend && (
            <DropdownMenuItem onClick={() => setExtendModalOpen(true)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Extend Deadline
            </DropdownMenuItem>
          )}
          
          {canClose && (
            <DropdownMenuItem onClick={() => setCloseModalOpen(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Close Early
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {canDistribute && (
            <DropdownMenuItem onClick={() => setDistributionModalOpen(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Distribution
            </DropdownMenuItem>
          )}
          
          {canUpdate && (
            <DropdownMenuItem onClick={() => setUpdateModalOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Post Update
            </DropdownMenuItem>
          )}
          
          {canExit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setExitModalOpen(true)}>
                <LogOut className="h-4 w-4 mr-2" />
                Exit Deal
              </DropdownMenuItem>
            </>
          )}
          
          {isDraft && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <PauseResumeModal
        open={pauseModalOpen}
        onOpenChange={setPauseModalOpen}
        deal={deal}
        onConfirm={handlePauseResume}
      />
      
      <CloseEarlyModal
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        deal={deal}
        onConfirm={handleCloseEarly}
      />
      
      <ExtendDeadlineModal
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
        deal={deal}
        onConfirm={handleExtendDeadline}
      />
      
      <RecordDistributionModal
        open={distributionModalOpen}
        onOpenChange={setDistributionModalOpen}
        deal={deal}
        onConfirm={handleRecordDistribution}
      />
      
      <UploadUpdateModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        deal={deal}
        onConfirm={handleUploadUpdate}
      />
      
      <ExitDealModal
        open={exitModalOpen}
        onOpenChange={setExitModalOpen}
        deal={deal}
        onConfirm={handleExitDeal}
      />
    </>
  );
}
