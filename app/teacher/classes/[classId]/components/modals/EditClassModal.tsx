"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, BookOpen, Calculator, Beaker, Atom, Palette, Music, Globe, Code, Cpu, Dumbbell, Heart, Star } from "lucide-react";
import { TextField, TextArea } from "@/components/common/Form";
import { CLASS_ICONS, CLASS_COLORS, CLASS_BANNERS } from "@/lib/classCustomization";

interface ClassFormData {
  name: string;
  subject: string;
  description: string;
  section: string;
  room: string;
  color: string;
  icon: string;
  banner: string;
}

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ClassFormData;
  onFormChange: (data: ClassFormData) => void;
  editing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditClassModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  editing,
  onSubmit,
}: EditClassModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "appearance">("basic");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
          onClick={() => !editing && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[75vh] overflow-hidden border-2 border-gray-100"
          >
            <div className="sticky top-0 z-10 border-b-2 border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="p-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Customize Class</h2>
                <button
                  onClick={onClose}
                  disabled={editing}
                  className="size-10 rounded-xl hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`relative px-4 py-3 font-bold text-sm transition-colors ${
                    activeTab === "basic"
                      ? "text-pink-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Basic Info
                  {activeTab === "basic" && (
                    <motion.div
                      layoutId="editClassTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-600"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("appearance")}
                  className={`relative px-4 py-3 font-bold text-sm transition-colors ${
                    activeTab === "appearance"
                      ? "text-pink-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Appearance
                  {activeTab === "appearance" && (
                    <motion.div
                      layoutId="editClassTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-pink-600"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col">
              <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(75vh - 220px)" }}>
              <AnimatePresence mode="wait">
              {activeTab === "basic" && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Class Name"
                    required
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    placeholder="AP Calculus"
                    disabled={editing}
                  />
                  <TextField
                    label="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) => onFormChange({ ...formData, subject: e.target.value })}
                    placeholder="Mathematics"
                    disabled={editing}
                  />
                </div>
                <TextArea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Class description..."
                  disabled={editing}
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Section"
                    value={formData.section}
                    onChange={(e) => onFormChange({ ...formData, section: e.target.value })}
                    placeholder="A"
                    disabled={editing}
                  />
                  <TextField
                    label="Room"
                    value={formData.room}
                    onChange={(e) => onFormChange({ ...formData, room: e.target.value })}
                    placeholder="101"
                    disabled={editing}
                  />
                </div>
                </motion.div>
              )}

              {activeTab === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
              {/* Icon Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Class Icon
                </h3>
                <div className="grid grid-cols-6 gap-3">
                  {CLASS_ICONS.map((icon) => {
                    const IconComponent = {
                      BookOpen,
                      Calculator,
                      Beaker,
                      Atom,
                      Palette,
                      Music,
                      Globe,
                      Code,
                      Cpu,
                      Dumbbell,
                      Heart,
                      Star,
                    }[icon.component];

                    return (
                      <motion.button
                        key={icon.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onFormChange({ ...formData, icon: icon.id })}
                        disabled={editing}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          formData.icon === icon.id
                            ? "border-pink-500 bg-pink-50 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={`size-6 mx-auto ${
                              formData.icon === icon.id ? "text-pink-600" : "text-gray-600"
                            }`}
                          />
                        )}
                        {formData.icon === icon.id && (
                          <div className="absolute -top-1 -right-1 size-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="size-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Theme Color
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {CLASS_COLORS.map((color) => (
                    <motion.button
                      key={color.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onFormChange({ ...formData, color: color.id })}
                      disabled={editing}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        formData.color === color.id
                          ? `${color.border} ${color.bg} shadow-lg`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className={`size-full rounded-lg bg-gradient-to-br ${color.gradient}`} />
                      {formData.color === color.id && (
                        <div className="absolute -top-1 -right-1 size-5 bg-gray-900 rounded-full flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-700 mt-2">{color.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Banner Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Header Banner
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CLASS_BANNERS.map((banner) => (
                    <motion.button
                      key={banner.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFormChange({ ...formData, banner: banner.id })}
                      disabled={editing}
                      className={`relative p-1 rounded-xl border-2 transition-all ${
                        formData.banner === banner.id
                          ? "border-pink-500 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`h-20 rounded-lg bg-gradient-to-r ${banner.gradient}`}
                      />
                      {formData.banner === banner.id && (
                        <div className="absolute -top-2 -right-2 size-6 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="size-4 text-white" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-700 mt-2 text-center">
                        {banner.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
                </motion.div>
              )}
              </AnimatePresence>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 p-6 border-t-2 border-gray-100 bg-white flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={editing}
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
