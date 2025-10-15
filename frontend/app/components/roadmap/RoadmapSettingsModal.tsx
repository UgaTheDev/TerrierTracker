"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Input,
} from "@heroui/react";
import { RoadmapConfig } from "../../../types/roadmap";

interface RoadmapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RoadmapConfig;
  onSave: (config: RoadmapConfig) => void;
}

export default function RoadmapSettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
}: RoadmapSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<RoadmapConfig>(config);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Roadmap Settings</ModalHeader>
        <ModalBody className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Display Calendar Years</h3>
              <p className="text-sm text-default-500">
                Show actual years (2025, 2026) instead of just semester names
              </p>
            </div>
            <Switch
              isSelected={localConfig.showYears}
              onValueChange={(checked) =>
                setLocalConfig({ ...localConfig, showYears: checked })
              }
            />
          </div>

          {localConfig.showYears && (
            <div className="space-y-4 p-4 bg-default-100 rounded-lg">
              <h3 className="font-semibold text-sm">Academic Year Settings</h3>

              <Input
                type="number"
                label="Starting Year"
                value={localConfig.startYear.toString()}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    startYear:
                      parseInt(e.target.value) || new Date().getFullYear(),
                  })
                }
                description="The calendar year when you start"
              />

              <div>
                <label className="text-sm font-medium block mb-2">
                  Starting Semester
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      localConfig.startSemester === "fall" ? "solid" : "flat"
                    }
                    color={
                      localConfig.startSemester === "fall"
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      setLocalConfig({ ...localConfig, startSemester: "fall" })
                    }
                  >
                    Fall
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      localConfig.startSemester === "spring" ? "solid" : "flat"
                    }
                    color={
                      localConfig.startSemester === "spring"
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      setLocalConfig({
                        ...localConfig,
                        startSemester: "spring",
                      })
                    }
                  >
                    Spring
                  </Button>
                </div>
              </div>

              <div className="text-xs text-default-500 mt-2">
                💡 <strong>Example:</strong> Starting Fall 2025 means Year 1 =
                Fall 2025 & Spring 2026
              </div>
            </div>
          )}

          <Input
            type="number"
            label="Program Length (Years)"
            value={localConfig.totalYears.toString()}
            onChange={(e) =>
              setLocalConfig({
                ...localConfig,
                totalYears: parseInt(e.target.value) || 4,
              })
            }
            min={1}
            max={10}
            description="Total number of academic years in your program"
          />

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Include Summer Semesters</h3>
              <p className="text-sm text-default-500">
                Add summer sessions to your roadmap
              </p>
            </div>
            <Switch
              isSelected={localConfig.includesSummer}
              onValueChange={(checked) =>
                setLocalConfig({ ...localConfig, includesSummer: checked })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
