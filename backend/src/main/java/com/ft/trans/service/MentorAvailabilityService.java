package com.ft.trans.service;

import java.sql.Date;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ft.trans.dto.MentorAvailabilityResponseDTO;
import com.ft.trans.dto.MentorAvailabilitySlotDTO;
import com.ft.trans.dto.SaveMentorAvailabilityDTO;
import com.ft.trans.entity.DayOfWeekEnum;
import com.ft.trans.entity.MentorAvailability;
import com.ft.trans.entity.Profile;
import com.ft.trans.repository.MentorAvailabilityRepository;
import com.ft.trans.repository.ProfileRepository;
import com.ft.trans.validation.ValidationResult;

@Service
public class MentorAvailabilityService {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final Set<Integer> ALLOWED_SLOT_DURATIONS = Set.of(30, 60);

    private final MentorAvailabilityRepository mentorAvailabilityRepository;
    private final ProfileRepository profileRepository;

    public MentorAvailabilityService(MentorAvailabilityRepository mentorAvailabilityRepository, ProfileRepository profileRepository)
    {
        this.mentorAvailabilityRepository = mentorAvailabilityRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public MentorAvailabilityServiceResult saveMentorAvailability(SaveMentorAvailabilityDTO request)
    {
        ValidationResult validation = validateRequest(request);

        if (validation.hasErrors())
            return new MentorAvailabilityServiceResult(null, validation);

        Profile mentor = profileRepository.findById(request.mentorId).orElse(null);
        if (mentor == null)
        {
            validation.addError("mentorId", "Perfil de mentor nao encontrado.");
            return new MentorAvailabilityServiceResult(null, validation);
        }

        List<ParsedSlot> parsedSlots = parseAndValidateSlots(request.availability, validation);
        validateOverlaps(parsedSlots, validation);

        if (validation.hasErrors())
            return new MentorAvailabilityServiceResult(null, validation);

        mentorAvailabilityRepository.deleteByMentor_Id(request.mentorId);

        Date now = new Date(System.currentTimeMillis());
        List<MentorAvailability> entities = new ArrayList<>();
        for (ParsedSlot slot : parsedSlots)
        {
            MentorAvailability entity = new MentorAvailability();
            entity.mentor = mentor;
            entity.dayOfWeek = slot.dayOfWeek();
            entity.startTime = slot.startTime();
            entity.endTime = slot.endTime();
            entity.slotDuration = request.slotDuration;
            entity.createdAt = now;
            entity.createdBy = request.mentorId;
            entity.lastUpdateAt = now;
            entity.lastUpdateBy = request.mentorId;
            entities.add(entity);
        }

        List<MentorAvailability> saved = mentorAvailabilityRepository.saveAll(entities);

        return new MentorAvailabilityServiceResult(
            toResponse(request.mentorId, request.slotDuration, saved),
            validation
        );
    }

    public MentorAvailabilityServiceResult getMentorAvailability(Long mentorId)
    {
        ValidationResult validation = new ValidationResult();

        if (mentorId == null)
        {
            validation.addError("mentorId", "mentorId deve ser informado.");
            return new MentorAvailabilityServiceResult(null, validation);
        }

        List<MentorAvailability> availability = mentorAvailabilityRepository
            .findByMentor_IdOrderByDayOfWeekAscStartTimeAsc(mentorId);

        Integer resolvedSlotDuration = resolveSlotDuration(availability);

        return new MentorAvailabilityServiceResult(
            toResponse(mentorId, resolvedSlotDuration, availability),
            validation
        );
    }

    private Integer resolveSlotDuration(List<MentorAvailability> availability)
    {
        for (MentorAvailability slot : availability)
        {
            if (slot.slotDuration != null && ALLOWED_SLOT_DURATIONS.contains(slot.slotDuration))
                return slot.slotDuration;
        }

        // Legacy rows may not have slotDuration persisted yet.
        return 60;
    }

    private ValidationResult validateRequest(SaveMentorAvailabilityDTO request)
    {
        ValidationResult validation = new ValidationResult();

        if (request == null)
        {
            validation.addError("request", "Payload da requisicao deve ser informado.");
            return validation;
        }

        if (request.mentorId == null)
            validation.addError("mentorId", "mentorId deve ser informado.");

        if (request.slotDuration == null)
            validation.addError("slotDuration", "slotDuration deve ser informado.");
        else if (!ALLOWED_SLOT_DURATIONS.contains(request.slotDuration))
            validation.addError("slotDuration", "slotDuration invalido. Valores permitidos: 30 ou 60.");

        if (request.availability == null)
            validation.addError("availability", "availability deve ser informado.");

        return validation;
    }

    private List<ParsedSlot> parseAndValidateSlots(List<MentorAvailabilitySlotDTO> slots, ValidationResult validation)
    {
        List<ParsedSlot> parsed = new ArrayList<>();

        if (slots == null)
            return parsed;

        for (int index = 0; index < slots.size(); index++)
        {
            MentorAvailabilitySlotDTO slot = slots.get(index);

            if (slot == null)
            {
                validation.addError("availability[" + index + "]", "Slot nao pode ser nulo.");
                continue;
            }

            DayOfWeekEnum dayOfWeek = parseDayOfWeek(slot.dayOfWeek, index, validation);
            LocalTime startTime = parseTime(slot.startTime, "startTime", index, validation);
            LocalTime endTime = parseTime(slot.endTime, "endTime", index, validation);

            if (startTime != null && endTime != null && !startTime.isBefore(endTime))
                validation.addError("availability[" + index + "].time", "startTime deve ser menor que endTime.");

            if (dayOfWeek != null && startTime != null && endTime != null && startTime.isBefore(endTime))
                parsed.add(new ParsedSlot(dayOfWeek, startTime, endTime));
        }

        return parsed;
    }

    private DayOfWeekEnum parseDayOfWeek(String dayOfWeek, int index, ValidationResult validation)
    {
        if (dayOfWeek == null || dayOfWeek.isBlank())
        {
            validation.addError("availability[" + index + "].dayOfWeek", "dayOfWeek deve ser informado.");
            return null;
        }

        try {
            return DayOfWeekEnum.fromString(dayOfWeek);
        } catch (IllegalArgumentException e) {
            validation.addError("availability[" + index + "].dayOfWeek", "dayOfWeek invalido. Use MONDAY..SUNDAY.");
            return null;
        }
    }

    private LocalTime parseTime(String value, String fieldName, int index, ValidationResult validation)
    {
        if (value == null || value.isBlank())
        {
            validation.addError("availability[" + index + "]." + fieldName, fieldName + " deve ser informado.");
            return null;
        }

        try {
            return LocalTime.parse(value, TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            validation.addError(
                "availability[" + index + "]." + fieldName,
                fieldName + " invalido. Use formato HH:mm."
            );
            return null;
        }
    }

    private void validateOverlaps(List<ParsedSlot> slots, ValidationResult validation)
    {
        Map<DayOfWeekEnum, List<ParsedSlot>> grouped = new EnumMap<>(DayOfWeekEnum.class);

        for (ParsedSlot slot : slots)
        {
            grouped.computeIfAbsent(slot.dayOfWeek(), key -> new ArrayList<>()).add(slot);
        }

        for (Map.Entry<DayOfWeekEnum, List<ParsedSlot>> entry : grouped.entrySet())
        {
            List<ParsedSlot> daySlots = entry.getValue();
            daySlots.sort((a, b) -> a.startTime().compareTo(b.startTime()));

            LocalTime previousEnd = null;
            for (ParsedSlot current : daySlots)
            {
                if (previousEnd != null && current.startTime().isBefore(previousEnd))
                {
                    validation.addError(
                        "availability",
                        "Conflito de horarios em " + entry.getKey().name() + "."
                    );
                    break;
                }
                previousEnd = current.endTime();
            }
        }
    }

    private MentorAvailabilityResponseDTO toResponse(Long mentorId, Integer slotDuration, List<MentorAvailability> availability)
    {
        MentorAvailabilityResponseDTO response = new MentorAvailabilityResponseDTO();
        response.mentorId = mentorId;
        response.slotDuration = slotDuration;

        for (MentorAvailability slot : availability)
        {
            MentorAvailabilitySlotDTO dto = new MentorAvailabilitySlotDTO();
            dto.dayOfWeek = slot.dayOfWeek.name();
            dto.startTime = slot.startTime.format(TIME_FORMATTER);
            dto.endTime = slot.endTime.format(TIME_FORMATTER);
            response.availability.add(dto);
        }

        response.availability.sort((a, b) -> {
            int dayCompare = parseDayOrder(a.dayOfWeek) - parseDayOrder(b.dayOfWeek);
            if (dayCompare != 0)
                return dayCompare;
            return a.startTime.compareTo(b.startTime);
        });

        return response;
    }

    private int parseDayOrder(String day)
    {
        try {
            return DayOfWeekEnum.fromString(day).ordinal();
        } catch (Exception e) {
            return Integer.MAX_VALUE;
        }
    }

    private record ParsedSlot(DayOfWeekEnum dayOfWeek, LocalTime startTime, LocalTime endTime) {}
}
