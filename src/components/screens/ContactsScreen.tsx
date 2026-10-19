import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { TrustedContact } from '../../types';
import { createWhatsAppDistressUrl, createSmsDistressUrl } from '../../utils/geolocation';
import { soundManager } from '../../utils/audio';

export const ContactsScreen: React.FC = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    user,
    currentLocation,
    setActiveTab,
    showToast,
  } = useSafety();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [relationship, setRelationship] = useState<TrustedContact['relationship']>('Friend');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [notifyOnJourneyStart, setNotifyOnJourneyStart] = useState<boolean>(true);
  const [notifyOnDeviation, setNotifyOnDeviation] = useState<boolean>(true);
  const [notifyOnSos, setNotifyOnSos] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setRelationship('Friend');
    setIsPrimary(contacts.length === 0);
    setNotifyOnJourneyStart(true);
    setNotifyOnDeviation(true);
    setNotifyOnSos(true);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: TrustedContact) => {
    setEditingContact(c);
    setName(c.name);
    setPhone(c.phone);
    setRelationship(c.relationship);
    setIsPrimary(c.isPrimary);
    setNotifyOnJourneyStart(c.notifyOnJourneyStart);
    setNotifyOnDeviation(c.notifyOnDeviation);
    setNotifyOnSos(c.notifyOnSos);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter a valid contact name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setValidationError('Please enter a valid phone number with area code.');
      return;
    }

    if (editingContact) {
      updateContact(editingContact.id, {
        name,
        phone,
        relationship,
        isPrimary,
        notifyOnJourneyStart,
        notifyOnDeviation,
        notifyOnSos,
      });
    } else {
      addContact({
        name,
        phone,
        relationship,
        isPrimary,
        notifyOnJourneyStart,
        notifyOnDeviation,
        notifyOnSos,
      });
    }

    setIsModalOpen(false);
  };

  const handleTestSms = (c: TrustedContact) => {
    soundManager.triggerHaptic(20);
    const url = createSmsDistressUrl(
      c.phone,
      user.name,
      currentLocation.lat,
      currentLocation.lng,
      'Test Safety Check'
    );
    window.open(url, '_blank');
    showToast(`Test alert link generated for ${c.name}`);
  };

  const handleTestWhatsApp = (c: TrustedContact) => {
    soundManager.triggerHaptic(20);
    const url = createWhatsAppDistressUrl(
      c.phone,
      user.name,
      currentLocation.lat,
      currentLocation.lng,
      'SafeSaathi Live Check-in'
    );
    window.open(url, '_blank');
    showToast(`Test WhatsApp link generated for ${c.name}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-10 px-4 rounded-2xl clay-card flex items-center gap-1.5 text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] hover:border-[#C86650] active:scale-95 transition shadow-xs border border-[#E9DFD2] dark:border-[#E99583]/25 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#702E46] dark:text-[#E99583]" />
            <span>Command Hub</span>
          </button>
          <div>
            <h1 className="text-base lg:text-xl font-extrabold text-[#45263F] dark:text-[#FAF5EF] tracking-tight">
              Trusted Circle &amp; Guardians
            </h1>
            <span className="text-xs font-medium text-[#62566F] dark:text-[#E9DFD2] hidden sm:inline">
              Designated recipients for live GPS beacons &amp; deviation escalation
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="clay-btn-primary h-11 px-5 flex items-center gap-2 text-xs font-bold"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 && (
          <div className="col-span-full text-center py-12 px-6 clay-card rounded-[32px] border border-dashed border-[#E9DFD2] flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5EF] dark:bg-[#281324] text-[#702E46] dark:text-[#E99583] flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#45263F] dark:text-[#FAF5EF]">No Trusted Contacts Added Yet</h3>
            <p className="text-xs font-medium text-[#62566F] dark:text-[#E9DFD2] max-w-sm">
              Add trusted family members or friends. They will receive automated GPS tracking alerts and emergency SOS beacons.
            </p>
            <button
              onClick={openAddModal}
              className="clay-btn-primary mt-2 h-10 px-5 flex items-center gap-2 text-xs font-bold"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Contact</span>
            </button>
          </div>
        )}

        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="clay-card rounded-[32px] p-5 lg:p-6 shadow-sm border border-[#E9DFD2] dark:border-[#E99583]/25 transition-all flex flex-col justify-between bg-white dark:bg-[#281324]"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#702E46] to-[#45263F] text-white font-extrabold text-base flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#29252D] dark:text-[#FAF5EF]">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold text-[#702E46] dark:text-[#E99583] bg-[#FAF5EF] dark:bg-[#231622] px-2 py-0.5 rounded-full border border-[#E9DFD2]">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#62566F] dark:text-[#E9DFD2] font-mono block mt-0.5">
                      {contact.phone} · {contact.relationship}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="w-8 h-8 rounded-xl hover:bg-[#FAF5EF] dark:hover:bg-[#45263F] text-[#62566F] hover:text-[#702E46] dark:text-[#E9DFD2] dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="w-8 h-8 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-[#62566F] hover:text-[#BA223C] flex items-center justify-center transition cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification preferences checklist */}
              <div className="mt-4 pt-3 border-t border-[#E9DFD2]/60 dark:border-[#E9DFD2]/15 space-y-1.5 text-xs font-medium text-[#29252D] dark:text-[#FAF5EF]">
                <div className="flex items-center justify-between">
                  <span className="text-[#62566F] dark:text-[#E9DFD2]">Journey Departure Alert:</span>
                  <span className={contact.notifyOnJourneyStart ? 'text-[#3D6B4E] dark:text-[#7E927B] font-bold' : 'text-[#62566F]'}>
                    {contact.notifyOnJourneyStart ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#62566F] dark:text-[#E9DFD2]">30s Route Deviation Beacon:</span>
                  <span className={contact.notifyOnDeviation ? 'text-[#3D6B4E] dark:text-[#7E927B] font-bold' : 'text-[#62566F]'}>
                    {contact.notifyOnDeviation ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#62566F] dark:text-[#E9DFD2]">Emergency SOS Broadcast:</span>
                  <span className={contact.notifyOnSos ? 'text-[#3D6B4E] dark:text-[#7E927B] font-bold' : 'text-[#62566F]'}>
                    {contact.notifyOnSos ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Dial & Beacon Buttons */}
            <div className="mt-5 pt-3 border-t border-[#E9DFD2]/60 dark:border-[#E9DFD2]/15 grid grid-cols-3 gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="clay-btn-secondary h-10 flex items-center justify-center gap-1.5 text-xs font-bold"
                title="Call Directly"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={() => handleTestSms(contact)}
                className="clay-btn-secondary h-10 flex items-center justify-center gap-1.5 text-xs font-bold"
                title="Send Live GPS SMS"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestWhatsApp(contact)}
                className="clay-btn-secondary h-10 flex items-center justify-center gap-1.5 text-xs font-bold"
                title="Send WhatsApp Beacon"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29252D]/80 backdrop-blur-md animate-fadeIn">
          <div className="clay-card-elevated w-full max-w-md p-6 shadow-2xl border-2 border-[#E9DFD2] relative bg-white dark:bg-[#281324]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFD2] dark:border-[#E9DFD2]/15 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#702E46]/15 text-[#702E46] dark:text-[#E99583] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-[#45263F] dark:text-[#FAF5EF]">
                  {editingContact ? 'Edit Guardian Details' : 'Add New Guardian'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#62566F] hover:text-[#BA223C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#BA223C] text-xs font-bold border border-red-200">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma, Mom, Dad"
                  className="w-full h-11 px-4 rounded-xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] text-xs font-bold text-[#29252D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C86650]/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Mobile Number (With Country Code)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] text-xs font-mono font-bold text-[#29252D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C86650]/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF] block mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as TrustedContact['relationship'])}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF5EF] dark:bg-[#231622] border border-[#E9DFD2] text-xs font-bold text-[#29252D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C86650]/40"
                >
                  <option value="Parent">Parent</option>
                  <option value="Partner">Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E9DFD2]/60 dark:border-[#E9DFD2]/15 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#702E46] accent-[#702E46]"
                  />
                  <span className="text-xs font-bold text-[#29252D] dark:text-[#FAF5EF]">
                    Set as Primary Guardian (First to be dialed on SOS)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnJourneyStart}
                    onChange={(e) => setNotifyOnJourneyStart(e.target.checked)}
                    className="w-4 h-4 rounded text-[#702E46] accent-[#702E46]"
                  />
                  <span className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">
                    Notify when journey starts
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnDeviation}
                    onChange={(e) => setNotifyOnDeviation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#702E46] accent-[#702E46]"
                  />
                  <span className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">
                    Notify on 30s route deviation anomaly
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnSos}
                    onChange={(e) => setNotifyOnSos(e.target.checked)}
                    className="w-4 h-4 rounded text-[#702E46] accent-[#702E46]"
                  />
                  <span className="text-xs font-semibold text-[#62566F] dark:text-[#E9DFD2]">
                    Broadcast on Emergency SOS activation
                  </span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="clay-btn-secondary h-11 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-primary h-11 px-6 text-xs font-bold"
                >
                  Save Guardian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
