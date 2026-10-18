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
            className="h-10 px-4 rounded-2xl glass-panel flex items-center gap-1.5 text-xs font-bold text-[#2A1637] dark:text-[#FAF4FE] hover:bg-purple-50/70 active:scale-95 transition shadow-xs border border-[#E8DEF3] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#6C3A82]" />
            <span>Command Hub</span>
          </button>
          <div>
            <h1 className="text-base lg:text-xl font-extrabold text-[#2A1637] dark:text-[#FAF4FE] tracking-tight">
              Trusted Circle &amp; Guardians
            </h1>
            <span className="text-xs font-medium text-[#7A6588] dark:text-purple-300 hidden sm:inline">
              Designated recipients for live GPS beacons &amp; deviation escalation
            </span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] hover:from-[#7B4294] hover:to-[#612D79] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-900/20 active:scale-95 transition cursor-pointer border border-white/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Guardian</span>
        </button>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 && (
          <div className="col-span-full text-center py-12 px-6 glass-panel rounded-[32px] border border-dashed border-[#E8DEF3] flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#6C3A82] flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#2A1637] dark:text-white">No Trusted Contacts Added Yet</h3>
            <p className="text-xs font-medium text-[#7A6588] max-w-sm">
              Add trusted family members or friends. They will receive automated GPS tracking alerts and emergency SOS beacons.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 h-10 px-5 rounded-2xl bg-[#6C3A82] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#55276B] active:scale-95 transition shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Contact</span>
            </button>
          </div>
        )}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="glass-panel rounded-[32px] p-5 lg:p-6 shadow-sm border border-[#E8DEF3] transition-all hover:bg-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C3A82] font-extrabold text-base flex items-center justify-center shrink-0 border border-purple-200/60">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#2A1637] dark:text-white">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#7A6588] font-mono block mt-0.5">
                      {contact.phone} · {contact.relationship}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="w-8 h-8 rounded-xl hover:bg-purple-50 text-[#7A6588] hover:text-[#6C3A82] flex items-center justify-center transition cursor-pointer"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="w-8 h-8 rounded-xl hover:bg-rose-50 text-[#7A6588] hover:text-[#DF4B5E] flex items-center justify-center transition cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification preferences checklist */}
              <div className="mt-4 pt-3 border-t border-[#F0E8F8] space-y-1.5 text-xs font-medium text-[#493356] dark:text-purple-200/90">
                <div className="flex items-center justify-between">
                  <span>Journey Departure Alert:</span>
                  <span className={contact.notifyOnJourneyStart ? 'text-emerald-700 font-bold' : 'text-[#7A6588]'}>
                    {contact.notifyOnJourneyStart ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>30s Route Deviation Beacon:</span>
                  <span className={contact.notifyOnDeviation ? 'text-emerald-700 font-bold' : 'text-[#7A6588]'}>
                    {contact.notifyOnDeviation ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Emergency SOS Broadcast:</span>
                  <span className={contact.notifyOnSos ? 'text-emerald-700 font-bold' : 'text-[#7A6588]'}>
                    {contact.notifyOnSos ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Dial & Beacon Buttons */}
            <div className="mt-5 pt-3 border-t border-[#F0E8F8] grid grid-cols-3 gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6C3A82] flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer border border-[#E8DEF3]"
                title="Call Directly"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>

              <button
                onClick={() => handleTestWhatsApp(contact)}
                className="h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6C3A82] flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer border border-[#E8DEF3]"
                title="Send Live GPS via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleTestSms(contact)}
                className="h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6C3A82] flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer border border-[#E8DEF3]"
                title="Send SMS Beacon"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated w-full max-w-md rounded-[32px] p-6 sm:p-7 shadow-2xl border border-purple-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E8F8]">
              <h3 className="text-base font-extrabold text-[#2A1637] dark:text-white">
                {editingContact ? 'Edit Trusted Contact' : 'Add New Trusted Guardian'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-purple-50 text-[#7A6588] hover:text-[#2A1637] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {validationError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                  {validationError}
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold text-[#2A1637] dark:text-purple-200 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-purple-950/40 border border-[#E8DEF3] text-sm font-bold text-[#2A1637] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3A82]/40"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-[#2A1637] dark:text-purple-200 uppercase tracking-wider block mb-1">
                  Mobile Number (E.164 Format)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-purple-950/40 border border-[#E8DEF3] text-sm font-bold text-[#2A1637] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#6C3A82]/40"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-[#2A1637] dark:text-purple-200 uppercase tracking-wider block mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as TrustedContact['relationship'])}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-purple-950/40 border border-[#E8DEF3] text-sm font-bold text-[#2A1637] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3A82]/40 cursor-pointer"
                >
                  <option value="Parent">Parent</option>
                  <option value="Partner">Partner</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-[#F0E8F8]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#2A1637] dark:text-purple-200">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6C3A82] accent-[#6C3A82]"
                  />
                  <span>Designate as Primary Guardian</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#493356] dark:text-purple-300">
                  <input
                    type="checkbox"
                    checked={notifyOnJourneyStart}
                    onChange={(e) => setNotifyOnJourneyStart(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6C3A82] accent-[#6C3A82]"
                  />
                  <span>Notify on Journey Start</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#493356] dark:text-purple-300">
                  <input
                    type="checkbox"
                    checked={notifyOnDeviation}
                    onChange={(e) => setNotifyOnDeviation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6C3A82] accent-[#6C3A82]"
                  />
                  <span>Notify on 30s Route Deviation</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#493356] dark:text-purple-300">
                  <input
                    type="checkbox"
                    checked={notifyOnSos}
                    onChange={(e) => setNotifyOnSos(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6C3A82] accent-[#6C3A82]"
                  />
                  <span>Notify on Emergency SOS Beacon</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-4 rounded-xl bg-purple-50 text-xs font-bold text-[#493356] hover:bg-purple-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white text-xs font-bold transition shadow-sm hover:opacity-95 active:scale-95 cursor-pointer border border-white/20"
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
